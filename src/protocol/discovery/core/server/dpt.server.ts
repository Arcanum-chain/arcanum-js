import * as dgram from "dgram";
import { EventEmitter } from "events";
import { LRUCache } from "lru-cache";

import { createDeferred, convertHexStrToUint } from "../../utils";
import { N2NParseUrl } from "../../../parse-url/parse-url.service";
import { DiscoveryProtocol as DPT } from "../discovery-protocol.module";
import { DefaultDiscoveryProtocolConstants } from "../../constants/defaut.contants";

import type { Socket as DgramSocket, RemoteInfo } from "dgram";
import type {
  DptEndpoint,
  DPTServerOptions,
  DiscoveryMessage,
} from "../../interface/message.interface";
import type { Contact } from "../../../types";

const VERSION = 0x04;

export class Server {
  public events: EventEmitter;
  protected _dpt: DPT;
  protected _timeout: number;
  protected _requests: Map<string, any>;
  protected _requestsCache: LRUCache<string, Promise<any>>;
  protected _socket: DgramSocket | null;
  private readonly urlParser: N2NParseUrl;
  private readonly endpoint: DptEndpoint;

  constructor(dpt: DPT, options: DPTServerOptions) {
    this.events = new EventEmitter();
    this._dpt = dpt;
    this.urlParser = new N2NParseUrl();

    this._timeout = options.timeout ?? 4000;
    this._requests = new Map();
    this._requestsCache = new LRUCache({ max: 1500, ttl: 1000 });
    this.endpoint = options.endpoint;

    const createSocket = dgram.createSocket.bind(0, { type: "udp4" });
    this._socket = createSocket();

    if (this._socket) {
      this._socket.bind(DefaultDiscoveryProtocolConstants.DEFAULT_PORT);
      this._socket.once("listening", () => {
        this.events.emit("listening");
      });
      this._socket.once("close", () => this.events.emit("close"));
      this._socket.on("error", (err) => this.events.emit("error", err));
      this._socket.on("message", (msg: Uint8Array, rinfo: RemoteInfo) => {
        try {
          this._handler(msg, rinfo);
        } catch (err: any) {
          this.events.emit("error", err);
        }
      });
    }
  }

  public bind(...args: any[]) {
    this._isAliveCheck();

    if (this._socket) this._socket.bind(...args);
  }

  public destroy(...args: any[]) {
    this._isAliveCheck();

    if (this._socket) {
      this._socket.close(...args);
      this._socket = null;
    }
  }

  public async ping(peer: Contact): Promise<any> {
    this._isAliveCheck();

    const payload = {
      type: "ping",
      to: peer,
      from: this.endpoint,
    };

    const msg = this.createMsg(payload);

    const rckey = this.createReqKey(msg);
    const promise = this._requestsCache.get(rckey);
    if (promise !== undefined) return promise;

    this._send(peer, msg);

    const deferred = createDeferred();
    this._requests.set(rckey, {
      peer,
      deferred,
      timeoutId: setTimeout(() => {
        if (this._requests.get(rckey) !== undefined) {
          this._requests.delete(rckey);
          deferred.reject(new Error(`Timeout error: ping ${peer.reiNodeUrl}`));
        } else {
          return deferred.promise;
        }
      }, this._timeout),
    });
    this._requestsCache.set(rckey, deferred.promise);
    return deferred.promise;
  }

  public findneighbours(peer: Contact, id: Uint8Array) {
    this._isAliveCheck();

    const msg = this.createMsg({ id, type: "findneighbours" });

    this._send(peer, msg, true);
  }

  _isAliveCheck() {
    if (this._socket === null) throw new Error("Server already destroyed");
  }

  public _send<T extends {}>(
    peer: Contact,
    data: DiscoveryMessage<T>,
    isFirstInstance?: boolean
  ) {
    const msg = Buffer.from(JSON.stringify(data));

    if (this._socket && typeof peer.udpPort === "number") {
      const address = isFirstInstance
        ? DefaultDiscoveryProtocolConstants.IP_ADDRESS
        : this.urlParser.getIp(peer.reiNodeUrl as string);
      const port = isFirstInstance
        ? DefaultDiscoveryProtocolConstants.DEFAULT_PORT
        : peer.udpPort;

      this._socket.send(msg, 0, msg.length, port, address as string);
    }

    return this.createReqKey(data);
  }

  private _handler(msg: Uint8Array, rinfo: RemoteInfo) {
    const info: DiscoveryMessage<any> = JSON.parse(msg.toString());
    const peerId = info.headers.nodeId;

    const peer = this._dpt.getPeer(peerId);

    if (
      peer === null &&
      info.payload.type === "ping" &&
      info.payload.from.udpPort !== null
    ) {
      setTimeout(() => this.events.emit("peers", [info.payload.from]), 100); // 100 ms
    }

    switch (info.payload.type) {
      case "ping": {
        const host = info.headers.origin.split(":")[0];
        const port = parseInt(info.headers.origin.split(":")[1], 10);

        const remote: Contact = {
          id: convertHexStrToUint(peerId),
          udpPort: rinfo.port,
          reiNodeUrl: this.urlParser.createReiUrl(
            info.headers.nodeId,
            host,
            port
          ),
          vectorClock: 0,
        };

        const payload = {
          to: {
            address: rinfo.address,
            udpPort: rinfo.port,
            tcpPort: info.payload?.from?.tcpPort,
          },
          type: "pong",
        };

        this._send(remote, this.createMsg(payload));
        break;
      }

      case "pong": {
        const rkey = this.createReqKey(info);
        const request = this._requests.get(rkey);

        if (request !== undefined) {
          this._requests.delete(rkey);

          request.deferred.resolve({
            id: convertHexStrToUint(peerId),
            address: (request.peer as Contact).address,
            udpPort: (request.peer as Contact).udpPort,
            tcpPort: (request.peer as Contact).tcpPort,
            vectorClock: 0,
            ownerAddress: (request.peer as Contact).ownerAddress,
            publicKey: (request.peer as Contact).publicKey,
            reiNodeUrl: (request.peer as Contact).reiNodeUrl,
          } satisfies Contact);
        }
        break;
      }

      case "findneighbours": {
        const remote: Contact = {
          id: convertHexStrToUint(peerId),
          udpPort: rinfo.port,
          address: rinfo.address,
          vectorClock: 0,
        };

        const payload = {
          peers: this._dpt.getClosestPeers(info.headers.nodeId),
          type: "neighbours",
        };

        const message = this.createMsg(payload);

        this._send(remote, message);
        break;
      }

      case "neighbours": {
        this.events.emit("peers", info.payload.peers);
        break;
      }
    }
  }

  private createMsg<T extends {}>(data: T) {
    const msg: DiscoveryMessage<T> = {
      headers: {
        nodeId: this.endpoint.nodeId,
        timestamp: Date.now(),
        origin: `${this.endpoint.address}:${this.endpoint.udpPort}`,
        version: VERSION,
      },
      payload: data,
    };

    return msg;
  }

  private createReqKey<T extends {}>(msg: DiscoveryMessage<T>) {
    return `${msg.headers.origin}/${msg.headers.nodeId.substring(10, 20)}`;
  }
}

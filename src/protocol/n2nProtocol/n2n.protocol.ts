import crypto from "node:crypto";
import { networkInterfaces } from "node:os";
import { v4 } from "uuid";
import WebSocket, { WebSocketServer } from "ws";
import { LRUCache } from "lru-cache";

import { Logger } from "../../logger";

import { DumpingService } from "../../dumping/dumping";
import { Node2NodeAdapter } from "../index";
import { RecoverService } from "../../recover/recover.service";
import { PeersStore } from "../../store";
import { N2NController } from "./n2n.controller";
import { N2NHandleMessagesService } from "./n2n.handle.messages";
import { SerializeProtocolData } from "./serialize.data";
import { N2NParseUrl } from "../parse-url/parse-url.service";
import { VerifyNode } from "../verify-node/verify-node.service";
import { VerifyNodeSignatureMiddleware } from "./middlewares/verify-signature.middleware";
import { KBucket } from "../k-bucket/k-bucket.service";
import { DiscoveryProtocol } from "../discovery";

import { DefaultDiscoveryProtocolConstants } from "../discovery/constants/defaut.contants";
import { bytesToHexString, convertHexStrToUint } from "../discovery/utils";

import type { Contact } from "../types";
import { convertContactToN2NNode } from "../discovery/utils";
import { MessageTypes } from "./constants/message.types";
import type { N2NProtocolConstructorInterface } from "./interfaces/constructor.interface";
import type { N2NNode } from "./interfaces/node.interface";
import type { N2NRequest } from "./interfaces/req.interface";
import type { N2NResponse } from "./interfaces/res.interface";

export class N2NProtocol {
  private serializeService: SerializeProtocolData;
  private props: N2NProtocolConstructorInterface = {};
  public nodeId: string = "";
  public isMainNode: boolean = false;
  public wss: WebSocketServer | undefined = undefined;
  public store: typeof PeersStore = PeersStore;
  private handleMsgService: N2NHandleMessagesService;
  private readonly n2nBlockChainAdapter: Node2NodeAdapter;
  private readonly dumpingService: DumpingService;
  private readonly recoverService: RecoverService;
  private readonly parseUrlService: N2NParseUrl;
  private readonly verifyNodeService: VerifyNode;
  public nodePublicKey: string = "";
  private readonly kBucket: KBucket;
  private readonly logger = new Logger(N2NProtocol.name);
  private readonly peersCache: LRUCache<string, Array<Contact> | Contact>;
  private dpt?: DiscoveryProtocol;

  constructor(
    private readonly port: number,
    public readonly mainNodeUrl: string,
    public readonly ownerAddress: string,
    props?: N2NProtocolConstructorInterface
  ) {
    this.serializeService = new SerializeProtocolData();
    this.props = props ?? {};
    this.isMainNode = props?.isMainNode ?? false;
    this.dumpingService = new DumpingService();
    this.recoverService = new RecoverService();
    this.handleMsgService = new N2NHandleMessagesService(
      this.nodeId,
      this.isMainNode
    );
    this.n2nBlockChainAdapter = new Node2NodeAdapter();
    this.parseUrlService = new N2NParseUrl();
    this.verifyNodeService = new VerifyNode();
    this.kBucket = KBucket.getInstance();
    this.peersCache = new LRUCache({
      maxSize: 5000,
      sizeCalculation: (item) => {
        return Buffer.byteLength(JSON.stringify(item));
      },
    });
  }

  public get wssServer() {
    return this.wss;
  }

  public set setNodeId(nodeId: string) {
    this.nodeId = nodeId;
  }

  public setNodePublicKey(key: string) {
    try {
      this.nodePublicKey = key;
    } catch (e) {
      throw e;
    }
  }

  public async createConnection() {
    try {
      const peers = this.store.protocolNodesActive;

      await Promise.all(
        Object.values(peers)
          .filter((node) => node.nodeId !== this.nodeId)
          .map(async (peer: N2NNode) => {
            const parsedUrl = this.parseUrlService.getWsUrl(peer.url);

            const ws = new WebSocket(parsedUrl.url, {
              handshakeTimeout: 1000,
            });

            ws.on("open", async () => {
              this.store.addActiveNode(this.nodeId, this.ownerAddress);
              const timestamp = new Date().getTime();
              const signature = await this.verifyNodeService.createSignature(
                this.nodeId,
                timestamp
              );

              this.sendMessage(
                {
                  message: MessageTypes.CONNECT_NODE,
                  payload: {
                    senderNodeId: parsedUrl.nodeId as string,
                    data: "",
                    ownerAddress: this.ownerAddress,
                  },
                  headers: {
                    origin: this.getLocalIPAddress(),
                    signature,
                    timestamp,
                  },
                },
                ws
              );
            });
          })
      );
    } catch (e) {
      throw e;
    }
  }

  public async closeServer() {
    try {
      if (this.wss) {
        this.wss.close();
      }
    } catch (e) {
      throw e;
    }
  }

  public async createMsgAllToNodes<T>(data: T, msgType: MessageTypes) {
    try {
      const timestamp = new Date().getTime();
      const signature = await this.verifyNodeService.createSignature(
        this.nodeId,
        timestamp
      );

      const message: N2NResponse<T> = {
        message: msgType,
        payload: {
          data: data,
          senderNodeId: this.nodeId,
          isMainNodeSender: this.isMainNode,
        },
        headers: {
          origin: this.getLocalIPAddress(),
          timestamp,
          signature,
        },
      };

      return message;
    } catch (e) {
      this.logger.error(`${(e as Error).message}`);
    }
  }

  public async createServer() {
    try {
      const wss = new WebSocket.Server({ port: this.port });

      this.wss = wss;

      this.dpt = new DiscoveryProtocol(this.nodeId, {
        endpoint: {
          address: this.parseUrlService.getIp(
            this.getLocalIPAddress()
          ) as string,
          tcpPort: this.port,
          udpPort: DefaultDiscoveryProtocolConstants.DEFAULT_PORT as number,
          nodeId: this.nodeId,
        },
      });

      await this.dpt.bootstrap({
        url: this.parseUrlService.createReiUrl(
          this.nodeId,
          this.parseUrlService.getIp(this.getLocalIPAddress()) as string,
          this.port
        ),
        tcpPort: this.port,
        udpPort: DefaultDiscoveryProtocolConstants.DEFAULT_PORT as number,
        nodeId: this.nodeId,
        user: this.ownerAddress,
        publicKey: this.nodePublicKey,
      });

      this.dpt.events.on("peer:new", (peer: Contact) => {
        const key = bytesToHexString(peer.id);

        if (this.peersCache.has(key)) return;

        this.peersCache.set(key, peer);
        this.peersCache.delete("all");
      });

      wss.on("connection", (ws) => {
        console.log("New node:", ws.url);

        ws.on("message", (msg: Uint8Array) => {
          const data = this.serializeService.deserialize(msg, "req");

          this.handleMessage(data as N2NRequest, ws);
        });
      });
    } catch (e) {
      throw e;
    }
  }

  private generateNodeId() {
    try {
      const genUUID = v4();

      const hash = crypto
        .createHash("sha256")
        .update(crypto.createHash("sha256").update(genUUID).digest("hex"))
        .digest("hex");

      this.nodeId = hash;

      return hash;
    } catch (e) {
      throw e;
    }
  }

  private sendMessage(msg: N2NRequest, ws: WebSocket) {
    try {
      const serializedMessage = this.serializeService.serialize(msg);
      ws.send(serializedMessage);
    } catch (e) {
      throw e;
    }
  }

  private sendResMessage(msg: N2NResponse<any>, ws: WebSocket) {
    try {
      return new Promise((resolve, reject) => {
        ws.on("message", (msg: Uint8Array) => {
          const response = this.serializeService.deserialize(msg, "res");
          resolve(response as N2NResponse<any>);
        });

        ws.on("error", (error) => {
          reject(error);
        });

        const serializedMessage = this.serializeService.serialize(msg);
        ws.send(serializedMessage);
      });
      // const serializedMessage = this.serializeService.serialize(msg);

      // ws.on("error", (e) => {
      //   console.log("Sender Error:", e);
      // });

      // ws.send(serializedMessage);
    } catch (e) {
      throw e;
    }
  }

  public async broadcastMessage(message: N2NResponse<any>, timeout?: number) {
    if (this.wss) {
      let peersArr = [];
      const concatArr: Contact[] = [];
      let isCacheData = false;

      if (
        this.peersCache.has("all") &&
        Array.isArray(this.peersCache.get("all"))
      ) {
        peersArr = this.peersCache.get("all") as Contact[];
        isCacheData = true;
      } else {
        peersArr = this.kBucket.getAll();
        isCacheData = false;
      }

      await Promise.all(
        peersArr.map(async (contact: Contact) => {
          const client = convertContactToN2NNode(contact);

          if (client.nodeId !== this.nodeId) {
            const parsedUrl = this.parseUrlService.getWsUrl(client.url);

            if (!isCacheData) {
              concatArr.push(contact);
            }

            const ws = new WebSocket(parsedUrl.url, {
              handshakeTimeout: timeout ?? 1000 * 60, // 1 minute,
            });

            ws.on("open", async () => {
              await this.sendResMessage(message, ws);
            });

            ws.on("message", async (msg: Uint8Array) => {
              const data = this.serializeService.deserialize(msg, "res");

              await this.handleMessage(data as N2NResponse<any>, ws);
            });

            ws.on("error", (err) => {
              this.logger.error(
                `Websocket disconnected\nDetails: ${(err as Error).message}`
              );
            });
          }
        })
      );

      if (!isCacheData) {
        this.peersCache.set("all", concatArr);
      }
    }
  }

  private async handleMessage(
    msg: N2NRequest | N2NResponse<any>,
    ws: WebSocket
  ) {
    try {
      await new VerifyNodeSignatureMiddleware().use(msg, ws);
      new N2NController(msg, ws, this.nodeId);
    } catch (e) {
      throw e;
    }
  }

  private getLocalIPAddress() {
    const interfaces = networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      // @ts-expect-error
      for (const iface of interfaces[name]) {
        if (iface.family === "IPv4" && !iface.internal) {
          return this.parseUrlService.createReiUrl(
            this.nodeId,
            iface.address,
            this.port
          );
        }
      }
    }
    return "";
  }
}

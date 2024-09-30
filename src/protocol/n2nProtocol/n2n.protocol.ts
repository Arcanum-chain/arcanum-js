import crypto from "node:crypto";
import { networkInterfaces } from "node:os";
import { v4 } from "uuid";
import WebSocket, { WebSocketServer } from "ws";

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

import { MessageTypes } from "./constants/message.types";
import type { N2NProtocolConstructorInterface } from "./interfaces/constructor.interface";
import type { N2NNode } from "./interfaces/node.interface";
import type { N2NRequest } from "./interfaces/req.interface";
import type { ResponseGetAllBlockchainData } from "./interfaces/res-all-blockchain-data.interface";
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
    this.recoverNodeId();
    this.handleMsgService = new N2NHandleMessagesService(
      this.nodeId,
      this.isMainNode
    );
    this.n2nBlockChainAdapter = new Node2NodeAdapter();
    this.parseUrlService = new N2NParseUrl();
    this.verifyNodeService = new VerifyNode();
  }

  public get wssServer() {
    return this.wss;
  }

  private async recoverNodeId() {
    try {
      const data = await this.recoverService.recoverNodeId();

      if (data) {
        this.nodeId = data;

        return;
      } else {
        const newHash = this.generateNodeId();
        this.nodeId = newHash;
        this.dumpingService.saveNodeIdN2N(newHash);
      }
    } catch (e) {
      console.log(e);
    }
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

  public async sendMsgAllToNodes<T>(data: T, msgType: MessageTypes) {
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

      await this.broadcastMessage(message);
    } catch (e) {
      console.log(e);
    }
  }

  public createServer() {
    try {
      const wss = new WebSocket.Server({ port: this.port });

      this.wss = wss;

      wss.on("connection", (ws) => {
        console.log("New node:", ws.url);

        ws.on("message", (msg: string) => {
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
        ws.on("message", (msg: string) => {
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

  private successfulVerifyNewNode(data: N2NResponse<any>) {
    try {
      if (data.message === MessageTypes.SUCCESSFUL_VERIFY_NEW_NODE) {
        const payload = data.payload.data as ResponseGetAllBlockchainData;

        this.store.protocolNodes = payload.list;
        this.store.protocolNodesActive = payload.actives;
        this.n2nBlockChainAdapter.synchronizeBlockChain(payload.blockChain);
        this.n2nBlockChainAdapter.synchronizeUser(payload.users);
        this.n2nBlockChainAdapter.synchronizeTxMemPool(payload.txsInMemPool);
        this.n2nBlockChainAdapter.synchronizeMetadata(payload.metadata);
        return;
      }

      // throw new BlockChainError(BlockChainErrorCodes.INVALID_VERIFY_NEW_NODE);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  private async broadcastMessage(message: N2NResponse<any>) {
    if (this.wss) {
      await Promise.all(
        (
          await this.store.getActiveNodes()
        ).map(async (client: N2NNode) => {
          if (client.nodeId !== this.nodeId) {
            const parsedUrl = this.parseUrlService.getWsUrl(client.url);

            const ws = new WebSocket(parsedUrl.url, {
              handshakeTimeout: 1000,
            });

            ws.on("open", async () => {
              await this.sendResMessage(message, ws);
            });

            ws.on("message", async (msg: string) => {
              const data = this.serializeService.deserialize(msg, "res");

              await this.handleMessage(data as N2NResponse<any>, ws);
            });

            ws.on("error", () => {
              console.log("Websocket disconnected");
            });
          }
        })
      );
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

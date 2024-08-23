import crypto from "node:crypto";
import { networkInterfaces } from "node:os";
import { v4 } from "uuid";
import WebSocket, { WebSocketServer } from "ws";

import { DumpingService } from "../dumping/dumping";
import { Node2NodeAdapter } from "../node-adapter/node-adapter";
import { RecoverService } from "../recover/recover.service";
import { PeersStore } from "../store";
import { N2NHandleMessagesService } from "./n2n.handle.messages";
import { SerializeProtocolData } from "./serialize.data";

import type { IBlock } from "@/block/block.interface";
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

  constructor(
    private readonly port: number,
    public readonly mainNodeUrl: string,
    public readonly publicKey: string,
    props?: N2NProtocolConstructorInterface
  ) {
    this.serializeService = new SerializeProtocolData();
    this.props = props ?? {};
    this.isMainNode = props?.isMainNode ?? false;
    this.dumpingService = new DumpingService();
    this.recoverService = new RecoverService();
    this.recoverNodeId();
    this.getMainNodeVerify();
    this.handleMsgService = new N2NHandleMessagesService(
      this.nodeId,
      this.isMainNode
    );
    this.n2nBlockChainAdapter = new Node2NodeAdapter();
  }

  private async recoverNodeId() {
    try {
      const data = await this.recoverService.recoverNodeId();

      if (data) {
        this.nodeId = data;

        return;
      } else {
        const newHash = this.generateNodeId();
        this.dumpingService.saveNodeIdN2N(newHash);
      }
    } catch (e) {
      console.log(e);
    }
  }

  private getMainNodeVerify() {
    try {
      if (this.isMainNode) {
        const node: N2NNode = {
          url: this.getLocalIPAddress(),
          timestamp: Date.now(),
          user: this.publicKey,
          nodeId: this.nodeId,
          lastActive: Date.now(),
          isActive: true,
        };

        this.store.setNewNode(node);
        this.store.addActiveNode(node.nodeId, this.publicKey);

        return;
      }

      const ws = new WebSocket(this.mainNodeUrl, {
        handshakeTimeout: 1000,
      });

      ws.on("open", () => {
        console.log(
          `Node by id ${this.nodeId} connected to main node(url: ${this.mainNodeUrl})`
        );

        this.sendMessage(
          {
            message: MessageTypes.GET_MAIN_NODE,
            payload: {
              nodeId: this.nodeId,
              data: this.isMainNode,
              publicKey: this.publicKey,
              origin: this.getLocalIPAddress(),
            },
          },
          ws
        );
      });

      ws.on("message", (msg: string) => {
        const message = this.serializeService.deserialize(msg, "res");
        this.successfulVerifyNewNode(message as N2NResponse<any>);
      });

      ws.on("close", () => {
        console.log("Node disconnected :(");
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  public createConnection() {
    try {
      const peers = this.store.protocolNodesActive;

      Object.values(peers)
        .filter((node) => node.nodeId !== this.nodeId)
        .forEach((peer: N2NNode) => {
          const ws = new WebSocket(peer.url, {
            handshakeTimeout: 1000,
          });

          ws.on("open", () => {
            this.store.addActiveNode(this.nodeId, this.publicKey);

            this.sendMessage(
              {
                message: MessageTypes.CONNECT_NODE,
                payload: {
                  nodeId: this.nodeId,
                  origin: this.getLocalIPAddress(),
                  data: "",
                  publicKey: this.publicKey,
                },
              },
              ws
            );
          });
        });
    } catch (e) {
      throw e;
    }
  }

  public sendMsgAllToNodes<T>(data: T, msgType: MessageTypes) {
    try {
      const message: N2NResponse<T> = {
        message: msgType,
        payload: {
          data: data,
          senderNodeId: this.nodeId,
          isMainNodeSender: this.isMainNode,
        },
      };

      this.broadcastMessage(message);
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

  private broadcastMessage(message: N2NResponse<any>) {
    if (this.wss) {
      this.store.getActiveNodes().forEach((client: N2NNode) => {
        if (client.nodeId !== this.nodeId) {
          const ws = new WebSocket(client.url, {
            handshakeTimeout: 1000,
          });

          ws.on("open", () => {
            this.sendResMessage(message, ws)
              .then()
              .catch((e) => console.log(e));
          });

          ws.on("message", (msg: string) => {
            const data = this.serializeService.deserialize(msg, "res");

            this.handleMessage(data as N2NResponse<any>, ws);
          });

          ws.on("error", () => {
            console.log("Websocket disconnected");
          });
        }
      });
    }
  }

  private handleMessage(msg: N2NRequest | N2NResponse<any>, ws: WebSocket) {
    try {
      switch (msg.message) {
        case MessageTypes.GET_MAIN_NODE:
          const sendMsg = this.handleMsgService.getMainNode(msg as N2NRequest);

          this.sendResMessage(sendMsg, ws)
            .then()
            .catch((e) => console.log(e));

          break;
        case MessageTypes.CONNECT_NODE:
          this.store.addActiveNode(
            (msg as N2NRequest).payload.nodeId,
            (msg as N2NRequest).payload.publicKey as string
          );

          break;
        case MessageTypes.BLOCK:
          if (this.nodeId !== (msg as N2NResponse<any>).payload.senderNodeId) {
            const sendMsgVerifyBlock =
              this.handleMsgService.addNewBlockFromNode(
                msg as N2NResponse<IBlock>
              );

            console.log("Send");

            this.sendResMessage(sendMsgVerifyBlock, ws)
              .then((res) => console.log("Response:", res))
              .catch((e) => console.log(e));
          }

          break;
        case MessageTypes.NODES_VERIFY_BLOCK:
          console.log("Verify");

          this.handleMsgService.verifyBlockResFromOtherNode(
            msg as N2NResponse<any>
          );

          break;
      }
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
          return `ws://${iface.address}:${this.port}`;
        }
      }
    }
    return ""; // Возвращаем пустую строку, если не нашли IP-адрес
  }
}

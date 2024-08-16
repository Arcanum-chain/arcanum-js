import crypto from "node:crypto";
import { networkInterfaces } from "node:os";
import { v4 } from "uuid";
import WebSocket, { WebSocketServer } from "ws";

import { Node2NodeAdapter } from "../node-adapter/node-adapter";
import { PeersStore } from "../store";
import { N2NHandleMessagesService } from "./n2n.handle.messages";
import { SerializeProtocolData } from "./serialize.data";

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

  constructor(
    private readonly port: number,
    public readonly mainNodeUrl: string,
    public readonly publicKey: string,
    props?: N2NProtocolConstructorInterface
  ) {
    this.serializeService = new SerializeProtocolData();
    this.props = props ?? {};
    this.isMainNode = props?.isMainNode ?? false;
    this.generateNodeId();
    this.getMainNodeVerify();
    this.handleMsgService = new N2NHandleMessagesService(
      this.nodeId,
      this.isMainNode
    );
    this.n2nBlockChainAdapter = new Node2NodeAdapter();
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

      const ws = new WebSocket(this.mainNodeUrl);

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
        this.successfulVerifyNewNode(message as N2NResponse);
      });

      ws.on("close", () => {
        console.log("Node disconnected :(");
      });
    } catch (e) {
      throw e;
    }
  }

  public createConnection() {
    try {
      const peers = this.store.protocolNodesActive;

      Object.values(peers)
        .filter((node) => node.nodeId !== this.nodeId)
        .forEach((peer: N2NNode) => {
          const ws = new WebSocket(peer.url);

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
      const message: N2NResponse = {
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

  private sendResMessage(msg: N2NResponse, ws: WebSocket) {
    try {
      const serializedMessage = this.serializeService.serialize(msg);
      ws.send(serializedMessage);
    } catch (e) {
      throw e;
    }
  }

  private successfulVerifyNewNode(data: N2NResponse) {
    try {
      if (data.message === MessageTypes.SUCCESSFUL_VERIFY_NEW_NODE) {
        this.store.protocolNodes = data.payload.data.list;
        this.store.protocolNodesActive = data.payload.data.actives;
        this.n2nBlockChainAdapter.synchronizeBlockChain(
          data.payload.data.blockChain
        );
        return;
      }

      // throw new BlockChainError(BlockChainErrorCodes.INVALID_VERIFY_NEW_NODE);
    } catch (e) {
      throw e;
    }
  }

  private broadcastMessage(message: N2NResponse) {
    if (this.wss) {
      console.log("Activs node:", this.store.getActiveNodes());

      this.store.getActiveNodes().forEach((client: N2NNode) => {
        if (client.nodeId !== this.nodeId) {
          const ws = new WebSocket(client.url);

          ws.on("open", () => {
            this.sendResMessage(message, ws);
          });

          ws.on("error", () => {
            console.log("Websocket disconnected");
          });
        }
      });
    }
  }

  private handleMessage(msg: N2NRequest | N2NResponse, ws: WebSocket) {
    try {
      switch (msg.message) {
        case MessageTypes.GET_MAIN_NODE:
          const sendMsg = this.handleMsgService.getMainNode(msg as N2NRequest);

          this.sendResMessage(sendMsg, ws);

          break;
        case MessageTypes.CONNECT_NODE:
          this.store.addActiveNode(
            (msg as N2NRequest).payload.nodeId,
            (msg as N2NRequest).payload.publicKey as string
          );

          break;
        case MessageTypes.BLOCK:
          const sendMsgVerifyBlock = this.handleMsgService.addNewBlockFromNode(
            msg as N2NResponse
          );

          if (sendMsgVerifyBlock) {
            this.sendResMessage(sendMsgVerifyBlock, ws);
          }

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

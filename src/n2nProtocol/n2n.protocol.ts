import crypto from "node:crypto";
import { v4 } from "uuid";
import WebSocket, { WebSocketServer } from "ws";

import { BlockChainError, BlockChainErrorCodes } from "../errors";
import { SerializeProtocolData } from "./serialize.data";

import { MessageTypes } from "./constants/message.types";
import type { N2NProtocolConstructorInterface } from "./interfaces/constructor.interface";
import type { NodeList } from "./interfaces/node.interface";
import type { N2NRequest } from "./interfaces/req.interface";
import type { N2NResponse } from "./interfaces/res.interface";

export class N2NProtocol {
  private serializeService: SerializeProtocolData;
  private props: N2NProtocolConstructorInterface = {};
  public protocolNodes: NodeList = {};
  public nodeId: string = "";
  public isMainNode: boolean = false;
  public wss: WebSocketServer | undefined = undefined;

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
  }

  private getMainNodeVerify() {
    try {
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
              origin: ws.url,
            },
          },
          ws
        );
      });

      ws.on("message", (msg: string) => {
        const message = this.serializeService.deserialize(msg, "res");
        this.successfulVerifyNewNode(message as N2NResponse);
      });
    } catch (e) {
      throw e;
    }
  }

  public createConnection() {
    try {
    } catch (e) {
      throw e;
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
        this.protocolNodes = data.payload.data as NodeList;
        return;
      }

      throw new BlockChainError(BlockChainErrorCodes.INVALID_VERIFY_NEW_NODE);
    } catch (e) {
      throw e;
    }
  }

  private broadcastMessage(message: N2NResponse) {
    if (this.wss) {
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          this.sendResMessage(message, client);
        }
      });
    }
  }

  private handleMessage(msg: N2NRequest, ws: WebSocket) {
    try {
      switch (msg.message) {
        case MessageTypes.GET_MAIN_NODE:
          const userPublicKey = msg.payload?.publicKey;

          if (!userPublicKey) {
            throw new BlockChainError(BlockChainErrorCodes.BAD_GATEWAY);
          }

          if (!this.protocolNodes[userPublicKey]) {
            this.protocolNodes[userPublicKey] = [];
          }

          const node = this.protocolNodes[userPublicKey].filter((userNode) => {
            return userNode.nodeId === msg.payload.nodeId;
          });

          if (node.length >= 1) {
            throw new BlockChainError(BlockChainErrorCodes.DUPLICATE_DATA);
          }

          this.protocolNodes[userPublicKey].push({
            user: userPublicKey,
            nodeId: msg.payload.nodeId,
            timestamp: Date.now(),
            url: msg.payload.origin,
          });

          this.broadcastMessage({
            message: MessageTypes.SUCCESSFUL_VERIFY_NEW_NODE,
            payload: {
              senderNodeId: this.nodeId,
              data: this.protocolNodes,
              isMainNodeSender: this.isMainNode,
            },
          });

          break;
      }
    } catch (e) {
      throw e;
    }
  }
}

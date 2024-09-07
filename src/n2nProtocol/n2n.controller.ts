import WebSocket from "ws";

import { PeersStore } from "../store";
import { MessageTypes } from "./constants/message.types";
import { N2NHandleMessagesService } from "./n2n.handle.messages";
import { SerializeProtocolData } from "./serialize.data";

import type { IBlock } from "../block/block.interface";
import type { Transaction } from "../transaction/transaction.interface";
import type { User } from "../user/user.interface";
import type { N2NRequest } from "./interfaces/req.interface";
import type { N2NResponse } from "./interfaces/res.interface";

export class N2NController {
  private readonly msg: N2NRequest | N2NResponse<any>;
  private readonly ws: WebSocket;
  private readonly handleMsgService: N2NHandleMessagesService;
  private readonly nodeId: string;
  private readonly serializeService: SerializeProtocolData;
  private readonly store: typeof PeersStore = PeersStore;

  constructor(
    msg: N2NRequest | N2NResponse<any>,
    ws: WebSocket,
    nodeId: string
  ) {
    this.msg = msg;
    this.ws = ws;
    this.nodeId = nodeId;
    this.handleMsgService = new N2NHandleMessagesService(nodeId, false);
    this.serializeService = new SerializeProtocolData();
    this.control();
  }

  private async control() {
    try {
      switch (this.msg.message) {
        case MessageTypes.GET_MAIN_NODE:
          const sendMsg = await this.handleMsgService.getMainNode(
            this.msg as N2NRequest
          );

          this.sendResMessage(sendMsg, this.ws)
            .then()
            .catch((e) => console.log(e));

          break;
        case MessageTypes.CONNECT_NODE:
          this.store.addActiveNode(
            (this.msg as N2NRequest).payload.nodeId,
            (this.msg as N2NRequest).payload.publicKey as string
          );

          break;
        case MessageTypes.BLOCK:
          if (
            this.nodeId !== (this.msg as N2NResponse<any>).payload.senderNodeId
          ) {
            const sendMsgVerifyBlock =
              this.handleMsgService.addNewBlockFromNode(
                this.msg as N2NResponse<IBlock>
              );

            this.sendResMessage(sendMsgVerifyBlock, this.ws)
              .then((res) => console.log("Response:", res))
              .catch((e) => console.log(e));
          }

          break;
        case MessageTypes.NODES_VERIFY_BLOCK:
          this.handleMsgService.verifyBlockResFromOtherNode(
            this.msg as N2NResponse<any>
          );

          break;
        case MessageTypes.TRANSACTION:
          this.handleMsgService.addNewTxFromNode(
            this.msg as N2NResponse<Transaction>
          );
          break;
        case MessageTypes.USER:
          this.handleMsgService.addNewUserFromNode(
            this.msg as N2NResponse<User>
          );
          break;
      }
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
    } catch (e) {
      throw e;
    }
  }
}

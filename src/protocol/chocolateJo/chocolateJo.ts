import { EventMessage } from "../../constants";
import { BlockChainMessage } from "../../utils";

import { MessageTypes } from "../n2nProtocol/constants/message.types";
import { N2NProtocol } from "../n2nProtocol/n2n.protocol";
import { MessageQueue } from "../message-queue/message-queue";

import type { IBlock, Transaction, User } from "../../blockchain-common";
import type { MessageEvent } from "../../utils";

export class ChocolateJo {
  private readonly protocol: N2NProtocol;
  private readonly messageQueue: MessageQueue;

  constructor(protocol: N2NProtocol, queue: MessageQueue) {
    this.protocol = protocol;
    this.messageQueue = queue;
    this.subscribe();
  }

  @BlockChainMessage(EventMessage.BLOCK_ADDED)
  private async broadcastNewBlock(block?: MessageEvent<IBlock>) {
    try {
      if (!block) return;

      const msg = await this.protocol.createMsgAllToNodes<IBlock>(
        block.msg as IBlock,
        MessageTypes.BLOCK
      );

      if (msg) {
        this.messageQueue.enqueue(msg);
      }
    } catch (e) {
      throw e;
    }
  }

  @BlockChainMessage(EventMessage.USER_ADDED)
  private async broadcastNewUser(user?: MessageEvent<User>) {
    try {
      if (!user) return;

      const msg = await this.protocol.createMsgAllToNodes<User>(
        user.msg as User,
        MessageTypes.USER
      );

      if (msg) {
        this.messageQueue.enqueue(msg);
      }
    } catch (e) {
      throw e;
    }
  }

  @BlockChainMessage(EventMessage.TRANSACTION_ADD_IN_MEMPOOL)
  private async broadcastTxInMemPool(msg?: MessageEvent<Transaction>) {
    try {
      if (!msg?.msg) return;

      const message = await this.protocol.createMsgAllToNodes<Transaction>(
        msg.msg,
        MessageTypes.TRANSACTION
      );

      if (message) {
        this.messageQueue.enqueue(message);
      }
    } catch (e) {
      throw e;
    }
  }

  private subscribe() {
    try {
      this.broadcastNewBlock();
      this.broadcastNewUser();
      this.broadcastTxInMemPool();
    } catch (e) {
      throw e;
    }
  }
}

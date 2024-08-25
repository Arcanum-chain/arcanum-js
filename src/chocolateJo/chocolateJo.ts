import { EventMessage } from "../constants";
import { BlockChainMessage } from "../utils";

import { MessageTypes } from "../n2nProtocol/constants/message.types";
import { N2NProtocol } from "../n2nProtocol/n2n.protocol";

import type { IBlock } from "../block/block.interface";
import type { Transaction } from "../transaction/transaction.interface";
import type { User } from "../user/user.interface";
import type { MessageEvent } from "../utils";

export class ChocolateJo {
  private readonly protocol: N2NProtocol;

  constructor(protocol: N2NProtocol) {
    this.protocol = protocol;
    this.subscribe();
  }

  @BlockChainMessage(EventMessage.BLOCK_ADDED)
  private broadcastNewBlock(block?: MessageEvent<IBlock>) {
    try {
      if (!block) return;

      this.protocol.sendMsgAllToNodes<IBlock>(
        block.msg as IBlock,
        MessageTypes.BLOCK
      );
    } catch (e) {
      throw e;
    }
  }

  @BlockChainMessage(EventMessage.USER_ADDED)
  private broadcastNewUser(user?: MessageEvent<User>) {
    try {
      if (!user) return;

      this.protocol.sendMsgAllToNodes<User>(
        user.msg as User,
        MessageTypes.USER
      );
    } catch (e) {
      throw e;
    }
  }

  @BlockChainMessage(EventMessage.TRANSACTION_ADD_IN_MEMPOOL)
  private broadcastTxInMemPool(msg?: MessageEvent<Transaction>) {
    try {
      if (!msg?.msg) return;

      this.protocol.sendMsgAllToNodes<Transaction>(
        msg.msg,
        MessageTypes.TRANSACTION
      );
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
      console.log(e);
      throw e;
    }
  }
}

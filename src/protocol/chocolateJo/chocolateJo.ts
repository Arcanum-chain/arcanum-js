import { EventMessage } from "../../constants";
import { BlockChainMessage } from "../../utils";

import { MessageTypes } from "../n2nProtocol/constants/message.types";
import { N2NProtocol } from "../n2nProtocol/n2n.protocol";

import type { IBlock, Transaction, User } from "../../blockchain-common";
import type { MessageEvent } from "../../utils";

export class ChocolateJo {
  private readonly protocol: N2NProtocol;

  constructor(protocol: N2NProtocol) {
    this.protocol = protocol;
    this.subscribe();
  }

  @BlockChainMessage(EventMessage.BLOCK_ADDED)
  private async broadcastNewBlock(block?: MessageEvent<IBlock>) {
    try {
      if (!block) return;

      await this.protocol.sendMsgAllToNodes<IBlock>(
        block.msg as IBlock,
        MessageTypes.BLOCK
      );
    } catch (e) {
      throw e;
    }
  }

  @BlockChainMessage(EventMessage.USER_ADDED)
  private async broadcastNewUser(user?: MessageEvent<User>) {
    try {
      if (!user) return;

      await this.protocol.sendMsgAllToNodes<User>(
        user.msg as User,
        MessageTypes.USER
      );
    } catch (e) {
      throw e;
    }
  }

  @BlockChainMessage(EventMessage.TRANSACTION_ADD_IN_MEMPOOL)
  private async broadcastTxInMemPool(msg?: MessageEvent<Transaction>) {
    try {
      if (!msg?.msg) return;

      await this.protocol.sendMsgAllToNodes<Transaction>(
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
      throw e;
    }
  }
}

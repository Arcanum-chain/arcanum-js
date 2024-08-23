import { EventMessage } from "../constants";
import { BlockChainMessage } from "../utils";

import { MessageTypes } from "../n2nProtocol/constants/message.types";
import { N2NProtocol } from "../n2nProtocol/n2n.protocol";

import type { IBlock } from "../block/block.interface";
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
        MessageTypes.BLOCK
      );
    } catch (e) {
      throw e;
    }
  }

  private subscribe() {
    try {
      this.broadcastNewBlock();
      this.broadcastNewUser();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}

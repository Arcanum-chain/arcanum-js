import { BlockChainError, BlockChainErrorCodes } from "../errors";
import { SecurityAssistent } from "../security-assistent/security-assistent";
import { BlockChainStore, PeersStore } from "../store";

import { MessageTypes } from "./constants/message.types";
import type { N2NRequest } from "./interfaces/req.interface";
import { N2NResponse } from "./interfaces/res.interface";

export class N2NHandleMessagesService {
  private readonly blockChainStore: typeof BlockChainStore = BlockChainStore;
  private readonly peersStore: typeof PeersStore = PeersStore;
  private readonly securityAssistentService: SecurityAssistent;

  constructor(
    private readonly nodeId: string,
    private readonly isMainNode: boolean
  ) {
    this.securityAssistentService = new SecurityAssistent();
  }

  public getMainNode(msg: N2NRequest) {
    try {
      const userPublicKey = msg.payload?.publicKey;

      if (!userPublicKey) {
        throw new BlockChainError(BlockChainErrorCodes.BAD_GATEWAY);
      }

      const newNode = {
        user: userPublicKey,
        nodeId: msg.payload.nodeId,
        timestamp: Date.now(),
        url: msg.payload.origin,
        lastActive: Date.now(),
        isActive: true,
      };

      this.peersStore.setNewNode(newNode);
      this.peersStore.addActiveNode(newNode.nodeId, newNode.user);

      const sendMsg = {
        message: MessageTypes.SUCCESSFUL_VERIFY_NEW_NODE,
        payload: {
          nodeId: msg.payload.nodeId,
          senderNodeId: this.nodeId,
          isMainNodeSender: this.isMainNode,
          data: {
            list: this.peersStore.protocolNodes,
            actives: this.peersStore.protocolNodesActive,
            blockChain: this.blockChainStore.getChain(),
            users: this.blockChainStore.getAllUsers(),
          },
        },
      };

      return sendMsg;
    } catch (e) {
      throw e;
    }
  }

  public addNewBlockFromNode(msg: N2NResponse) {
    try {
      const isNotMyNode = this.notSenderNodeFilter(msg.payload.senderNodeId);

      if (isNotMyNode) {
        this.securityAssistentService.verifyNewBlock(msg.payload.data);

        this.blockChainStore.setNewBlockToChain(msg.payload.data);

        const sendMsg = {
          message: MessageTypes.NODES_VERIFY_BLOCK,
          payload: {
            senderNodeId: this.nodeId,
            nodeId: msg.payload.senderNodeId,
            data: true,
            isMainNodeSender: this.isMainNode,
          },
        };

        return sendMsg;
      }

      throw new BlockChainError(BlockChainErrorCodes.IS_MY_NODE);
    } catch (e) {
      console.log(e);
    }
  }

  private notSenderNodeFilter(senderId: string) {
    try {
      if (senderId === this.nodeId) {
        return false;
      }

      return true;
    } catch (e) {
      throw e;
    }
  }
}

import { BlockConfirmationService } from "../confirmationBlock";
import { BlockChainError, BlockChainErrorCodes } from "../errors";
import { MemPool } from "../memPool/memPool";
import { SecurityAssistent } from "../security-assistent/security-assistent";
import { BlockChainStore, MetadataBlockchainStore, PeersStore } from "../store";

import type { IBlock } from "@/block/block.interface";
import type { Transaction } from "../transaction/transaction.interface";
import type { User } from "../user/user.interface";
import { MessageTypes } from "./constants/message.types";
import type { ResponseConfirmVerifyNodeBlockDto } from "./dto/res-confirm-verify-block.dto";
import type { N2NRequest } from "./interfaces/req.interface";
import type { N2NResponse } from "./interfaces/res.interface";

export class N2NHandleMessagesService {
  private readonly blockChainStore: typeof BlockChainStore = BlockChainStore;
  private readonly peersStore: typeof PeersStore = PeersStore;
  private readonly securityAssistentService: SecurityAssistent;
  private readonly metadataStore: typeof MetadataBlockchainStore =
    MetadataBlockchainStore;
  private readonly confirmationBlockService: typeof BlockConfirmationService =
    BlockConfirmationService;
  private readonly memPoolService: MemPool;

  constructor(
    private readonly nodeId: string,
    private readonly isMainNode: boolean
  ) {
    this.securityAssistentService = new SecurityAssistent();
    this.memPoolService = MemPool.getInstance();
  }

  public async getMainNode(msg: N2NRequest) {
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

      const chain = await this.blockChainStore.getChain();

      const sendMsg = {
        message: MessageTypes.SUCCESSFUL_VERIFY_NEW_NODE,
        payload: {
          nodeId: msg.payload.nodeId,
          senderNodeId: this.nodeId,
          isMainNodeSender: this.isMainNode,
          data: {
            list: this.peersStore.protocolNodes,
            actives: this.peersStore.protocolNodesActive,
            blockChain: chain,
            users: this.blockChainStore.getAllUsers(),
            txsInMemPool: this.blockChainStore.getAllTransactionsFromMemPull(),
            metadata: {
              difficulty: this.metadataStore.getDifficulty,
              blockReward: this.metadataStore.getBlockReward(chain.length),
              lastVerifyBlock: this.metadataStore.getLastVerifyBlockInChain,
            },
          },
        },
      };

      return sendMsg;
    } catch (e) {
      throw e;
    }
  }

  public addNewBlockFromNode(msg: N2NResponse<IBlock>) {
    try {
      const isNotMyNode = this.notSenderNodeFilter(msg.payload.senderNodeId);

      if (isNotMyNode) {
        this.securityAssistentService.verifyNewBlock(msg.payload.data);

        this.blockChainStore.setNewBlockToChainFromOtherNode(msg.payload.data);

        const sendMsg = {
          message: MessageTypes.NODES_VERIFY_BLOCK,
          payload: {
            senderNodeId: this.nodeId,
            nodeId: msg.payload.senderNodeId,
            data: {
              hash: msg.payload.data.hash,
              isVerify: true,
            } as ResponseConfirmVerifyNodeBlockDto,
            isMainNodeSender: this.isMainNode,
          },
        };

        return sendMsg;
      }

      throw new BlockChainError(BlockChainErrorCodes.IS_MY_NODE);
    } catch (e) {
      const sendMsg = {
        message: MessageTypes.NODES_VERIFY_BLOCK,
        payload: {
          senderNodeId: this.nodeId,
          nodeId: msg.payload.senderNodeId,
          data: {
            hash: msg.payload.data.hash,
            isVerify: false,
          } as ResponseConfirmVerifyNodeBlockDto,
          isMainNodeSender: this.isMainNode,
        },
      };

      return sendMsg;
    }
  }

  public verifyBlockResFromOtherNode(
    msg: N2NResponse<ResponseConfirmVerifyNodeBlockDto>
  ) {
    try {
      const isVerify = msg.payload.data.isVerify;
      const hash = msg.payload.data.hash;

      if (isVerify) {
        this.confirmationBlockService.confirmBlock(hash);
      }
    } catch (e) {
      throw e;
    }
  }

  public addNewTxFromNode(msg: N2NResponse<Transaction>) {
    try {
      this.securityAssistentService.verifyNewTxInMemPoolFromOtherNode(
        msg.payload.data
      );
      this.memPoolService.addNewTxFromOtherNode(msg.payload.data);
    } catch (e) {
      throw e;
    }
  }

  public addNewUserFromNode(msg: N2NResponse<User>) {
    try {
      const user = msg.payload.data;

      console.log(msg);

      this.securityAssistentService.verifyNewUserFromNode(user);
      this.blockChainStore.setNewUserFromOtherNode(user);
    } catch (e) {
      throw e;
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

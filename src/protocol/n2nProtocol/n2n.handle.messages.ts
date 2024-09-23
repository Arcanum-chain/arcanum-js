import { BlockChainError, BlockChainErrorCodes } from "../../errors";
import { MemPool, BlockConfirmationService } from "../../blockchain-common";
import { SecurityAssistent } from "../../blockchain-safety";
import {
  BlockChainStore,
  MetadataBlockchainStore,
  PeersStore,
} from "../../store";
import { VerifyNode } from "../verify-node/verify-node.service";
import { N2NParseUrl } from "../parse-url/parse-url.service";

import type { IBlock, Transaction, User } from "../../blockchain-common";
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
  private readonly verifyNodeService: VerifyNode;
  private readonly paseUrlService: N2NParseUrl;

  constructor(
    private readonly nodeId: string,
    private readonly isMainNode: boolean
  ) {
    this.securityAssistentService = new SecurityAssistent();
    this.memPoolService = MemPool.getInstance();
    this.verifyNodeService = new VerifyNode();
    this.paseUrlService = new N2NParseUrl();
  }

  public async getMainNode(message: N2NRequest) {
    try {
      const ownerAddress = message?.payload?.ownerAddress;

      if (!ownerAddress) {
        throw new BlockChainError(BlockChainErrorCodes.BAD_GATEWAY);
      }

      const { nodeId } = this.paseUrlService.getWsUrl(message?.headers?.origin);

      const newNode = {
        user: ownerAddress,
        nodeId: nodeId ?? "",
        timestamp: Date.now(),
        url: message.headers.origin,
        lastActive: Date.now(),
        isActive: true,
        publicKey: message?.payload?.data?.publicKey,
      };

      this.peersStore.setNewNode(newNode);
      this.peersStore.addActiveNode(newNode.nodeId, newNode.user);

      const chain = await this.blockChainStore.getChain();

      const data = {
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
      };

      const msg = await this.createMsg(
        MessageTypes.SUCCESSFUL_VERIFY_NEW_NODE,
        data
      );

      return msg;
    } catch (e) {
      throw e;
    }
  }

  public async addNewBlockFromNode(msg: N2NResponse<IBlock>) {
    try {
      const isNotMyNode = this.notSenderNodeFilter(msg.payload.senderNodeId);

      if (isNotMyNode) {
        this.securityAssistentService.verifyNewBlock(msg.payload.data);

        await this.blockChainStore.setNewBlockToChainFromOtherNode(
          msg.payload.data
        );

        const data = {
          hash: msg.payload.data.hash,
          isVerify: true,
        } as ResponseConfirmVerifyNodeBlockDto;

        const sendMsg = await this.createMsg(
          MessageTypes.NODES_VERIFY_BLOCK,
          data
        );

        return sendMsg;
      }

      throw new BlockChainError(BlockChainErrorCodes.IS_MY_NODE);
    } catch (e) {
      const data = {
        hash: msg.payload.data.hash,
        isVerify: false,
      } as ResponseConfirmVerifyNodeBlockDto;

      const sendMsg = await this.createMsg(
        MessageTypes.NODES_VERIFY_BLOCK,
        data
      );

      return sendMsg;
    }
  }

  public async verifyBlockResFromOtherNode(
    msg: N2NResponse<ResponseConfirmVerifyNodeBlockDto>
  ) {
    try {
      const isVerify = msg.payload.data.isVerify;
      const hash = msg.payload.data.hash;

      if (isVerify) {
        await this.confirmationBlockService.confirmBlock(hash);
      }
    } catch (e) {
      throw e;
    }
  }

  public async addNewTxFromNode(msg: N2NResponse<Transaction>) {
    try {
      await this.securityAssistentService.verifyNewTxInMemPoolFromOtherNode(
        msg.payload.data
      );
      await this.memPoolService.addNewTxFromOtherNode(msg.payload.data);
    } catch (e) {
      throw e;
    }
  }

  public async addNewUserFromNode(msg: N2NResponse<User>) {
    try {
      const user = msg.payload.data;

      await this.securityAssistentService.verifyNewUserFromNode(user);
      await this.blockChainStore.setNewUserFromOtherNode(user);
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

  private async createMsg<T>(type: MessageTypes, data: T) {
    try {
      const timestamp = new Date().getTime();
      const signature = await this.verifyNodeService.createSignature(
        this.nodeId,
        timestamp
      );

      const sendMsg: N2NResponse<T> = {
        message: type,
        payload: {
          senderNodeId: this.nodeId,
          isMainNodeSender: this.isMainNode,
          data: data,
        },
        headers: {
          timestamp,
          signature,
          origin,
        },
      };

      return sendMsg;
    } catch (e) {
      throw e;
    }
  }
}

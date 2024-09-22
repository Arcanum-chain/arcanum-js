import { BlockChainStore, PeersStore } from "../../store";

import { Singleton } from "../../basic";
import { Block } from "../block/block";
import { BlockConfirmationService } from "../confirmationBlock";
import { MiningBlock } from "../mining/mining";
import { BlockTransaction, BlockChainUser } from "../index";
import { VerifyBlockService } from "../../utils/verify.block.util.service";

import type { BlockConstructor, IBlock, Transaction, User } from "../index";

export class BlockChain extends Singleton {
  private blockChainUser: BlockChainUser;
  private verifyBlockService: VerifyBlockService;
  private readonly store: typeof BlockChainStore = BlockChainStore;
  private readonly peersStore: typeof PeersStore = PeersStore;
  private readonly blockConfirmations: typeof BlockConfirmationService =
    BlockConfirmationService;

  constructor() {
    super();

    this.blockChainUser = new BlockChainUser();
    this.verifyBlockService = new VerifyBlockService();

    if (this) {
      return this;
    }
  }

  public async createGenesisBlock() {
    const blockData: BlockConstructor["data"] = {
      transactions: {},
    };

    const payload: BlockConstructor = {
      index: 0,
      timestamp: Date.now(),
      prevBlockHash: "",
      data: blockData,
    };

    const block = new Block(payload);

    block.verify = true;

    const newBlock: IBlock = {
      index: block.index,
      timestamp: block.timestamp,
      prevBlockHash: "",
      hash: block.hash,
      data: { transactions: {}, blockHash: block.hash },
      verify: true,
      nonce: block.nonce,
    };

    await this.store.addGenesisBlock(newBlock);

    return block;
  }

  public getChain() {
    try {
      return this.store.getChain();
    } catch (e) {
      throw e;
    }
  }

  public async getLatestBlock() {
    const chain = await this.store.getChain();

    return chain[chain.length - 1];
  }

  public async getBlockByHash(blockHash: string) {
    return await this.store.getBlockByHash(blockHash);
  }

  public async isValidChain() {
    const chain = (await this.store.getChain()).reverse();

    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      if (currentBlock.prevBlockHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  public async mineBlock(minerAddress: string) {
    const lastBlock = await this.getLatestBlock();

    const payload: BlockConstructor = {
      index: lastBlock?.index + 1,
      timestamp: Date.now(),
      data: {
        transactions: {},
      },
      prevBlockHash: lastBlock?.hash ?? "",
    };

    const newBlock = new Block(payload);
    const chain = await this.store.getChain();

    if (
      Object.values(this.peersStore.getAllNodes).length === 1 &&
      Object.values(await this.peersStore.getActiveNodes()).length === (1 || 0)
    ) {
      const newMiningBlock = await new MiningBlock(minerAddress).mineBlock(
        newBlock
      );

      this.store.newCreatedBlock(newMiningBlock);
      await this.blockConfirmations.confirmBlock(newBlock.hash);

      const isValidChain = await this.isValidChain();

      if (isValidChain) {
        return newBlock;
      } else if (!isValidChain) {
        throw new Error("Not valid chain!!!!");
      }
    }

    if (this.store.getPendingBlocks().length == 0) {
      const newMiningBlock = await new MiningBlock(minerAddress).mineBlock(
        newBlock
      );

      this.store.newCreatedBlock(newMiningBlock);
      await this.store.setNewBlockToChain(newMiningBlock.hash);

      const isValidChain = await this.isValidChain();

      if (isValidChain) {
        return newMiningBlock;
      } else if (!isValidChain) {
        throw new Error("Not valid chain!!!!");
      }
    }
  }

  public async getTxs(): Promise<Transaction[]> {
    try {
      return await this.store.getAllTransactionsFromMemPull();
    } catch (e) {
      throw e;
    }
  }

  public async getTxByHash(hash: string): Promise<Transaction> {
    try {
      const data = await this.store.getTransactionByHash(hash);

      return data;
    } catch (e) {
      throw e;
    }
  }

  public async createTransaction({
    sender,
    to,
    amount,
    signature,
  }: {
    sender: string;
    to: string;
    amount: number;
    signature: string;
  }) {
    try {
      const chain = await this.store.getChain();

      const transaction = await new BlockTransaction({
        sender,
        amount,
        timestamp: Date.now(),
        to,
        indexBlock: 0,
        blockHash: chain[chain.length - 1].hash,
        signature,
      }).createTransaction();

      await this.store.setNewTransactionToMemPull(transaction);

      return transaction;
    } catch (e) {
      throw e;
    }
  }

  public async createNewUser() {
    try {
      const data = await this.blockChainUser.createNewUser();

      return data;
    } catch (e) {
      throw e;
    }
  }

  public async getUserByAddress(address: string) {
    try {
      return await this.blockChainUser.getUserByAddress(address);
    } catch (e) {
      throw e;
    }
  }

  public async getAllUsers() {
    const data = await this.store.getAllUsers();

    return data;
  }
}

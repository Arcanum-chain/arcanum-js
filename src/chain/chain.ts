import { BlockChainStore, PeersStore } from "../store";

import { Singleton } from "../basic";
import { Block } from "../block/block";
import { BlockConfirmationService } from "../confirmationBlock";
import { MiningBlock } from "../mining/mining";
import { BlockTransaction } from "../transaction/transaction";
import { BlockChainUser } from "../user/user";
import { VerifyBlockService } from "../utils/verify.block.util.service";

import { DEFAULT_HASH_PREFIX } from "../constants/default.hash.prefix";
import { IS_MAIN_NODE, PEERS } from "../constants/peers.constanrs";

import type { BlockConstructor } from "../block/block.interface";
import type { Transaction } from "../transaction/transaction.interface";
import type { User } from "../user/user.interface";

export class BlockChain extends Singleton {
  public chain: Block[] = [];
  private readonly peers: string[];
  private users: Record<User["publicKey"], User> = {};
  private blockChainUser: BlockChainUser;
  private verifyBlockService: VerifyBlockService;
  private readonly store: typeof BlockChainStore = BlockChainStore;
  private readonly peersStore: typeof PeersStore = PeersStore;
  private readonly blockConfirmations: typeof BlockConfirmationService =
    BlockConfirmationService;

  constructor() {
    super();

    this.chain = IS_MAIN_NODE ? [] : [];
    this.peers = PEERS;
    this.users = {};
    this.blockChainUser = new BlockChainUser(this.users);
    this.verifyBlockService = new VerifyBlockService();

    if (this) {
      return this;
    }
  }

  public createGenesisBlock() {
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

    this.store.addGenesisBlock(block);

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

  public isValidChain(chain: Block[]) {
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

    if (
      Object.values(this.peersStore.getAllNodes).length === 1 &&
      Object.values(this.peersStore.getActiveNodes()).length === (1 || 0)
    ) {
      await new MiningBlock(minerAddress).mineBlock(newBlock);

      this.store.newCreatedBlock(newBlock);
      this.blockConfirmations.confirmBlock(newBlock.hash);

      const isValidChain = this.isValidChain(this.chain);

      if (isValidChain) {
        return newBlock;
      } else if (!isValidChain) {
        throw new Error("Not valid chain!!!!");
      }
    }

    if (this.store.getPendingBlocks().length == 0) {
      new MiningBlock(minerAddress).mineBlock(newBlock);

      this.store.newCreatedBlock(newBlock);

      const isValidChain = this.isValidChain(this.chain);

      if (isValidChain) {
        return newBlock;
      } else if (!isValidChain) {
        throw new Error("Not valid chain!!!!");
      }
    }
  }

  public replaceChain(newChain: Block[]) {
    if (newChain.length > this.chain.length && this.isValidChain(newChain)) {
      this.chain = newChain;
      console.log("Новая цепочка блоков принята");
    } else {
      console.log("Новая цепочка блоков недействительна");
    }
  }

  public getTxs(): Transaction[] {
    try {
      return this.store.getAllTransactionsFromMemPull();
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

      const transaction = new BlockTransaction({
        sender,
        amount,
        timestamp: Date.now(),
        to,
        indexBlock: 0,
        blockHash: chain[chain.length - 1].hash,
        users: this.users,
        signature,
      }).createTransaction();

      this.store.setNewTransactionToMemPull(transaction);

      // const payload: Omit<Transaction, "blockHash"> = {
      //   hash: transaction.hash,
      //   data: {
      //     sender: transaction.sender,
      //     amount: transaction.amount,
      //     to: transaction.to,
      //     timestamp: transaction.timestamp,
      //   },
      //   fee: transaction.fee,
      // };

      return transaction;
    } catch (e) {
      throw e;
    }
  }

  public addNewUserToChain(newUsers: User) {
    try {
      const isEmptyUser = this.users[newUsers.publicKey];

      if (isEmptyUser) {
        throw new Error("Пользователь уже существует");
      }

      if (!newUsers.publicKey.startsWith(DEFAULT_HASH_PREFIX)) {
        throw new Error("Invalid hash");
      }

      this.store.setNewUser(newUsers);

      return true;
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

  public getUserBalance(address: string) {
    try {
      return this.blockChainUser.getUserBalance(address);
    } catch (e) {
      throw e;
    }
  }

  public getAllUsers() {
    return this.store.getAllUsers();
  }

  private minerReward(minerAddress: string) {
    try {
    } catch (e) {
      throw e;
    }
  }
}

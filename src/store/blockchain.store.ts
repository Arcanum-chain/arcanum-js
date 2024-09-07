import EventEmitter from "events";

import { DataSource } from "../database/datasource.service";

import { EventMessage } from "../constants";
import { BlockChainError, BlockChainErrorCodes } from "../errors";

import type { Transaction } from "@/transaction/transaction.interface";
import { IBlock } from "../block/block.interface";
import type { User } from "../user/user.interface";

class BlockChainStore extends EventEmitter {
  public chain: Record<IBlock["hash"], IBlock> = {};
  public users: Record<User["address"], User> = {};
  public memPullTransactions: Record<Transaction["hash"], Transaction> = {};
  public pendingBlocks: IBlock[] = [];
  private readonly db: DataSource;

  constructor() {
    super();

    this.db = DataSource.getInstance();
  }

  public async addGenesisBlock(genesisBlock: IBlock) {
    try {
      await this.db.blocks.create({
        key: genesisBlock.hash,
        data: genesisBlock,
      });
    } catch (e) {
      throw e;
    }
  }

  public async getChain(): Promise<IBlock[]> {
    try {
      return await this.db.blocks.findMany();
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public getPendingBlocks(): IBlock[] {
    try {
      return this.pendingBlocks;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public synchronizeChain(newChain: IBlock[]) {
    try {
      this.chain = {};

      for (const block of newChain) {
        this.chain[block.hash] = block;
      }
    } catch (e) {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_SYNCHRONIZE_CHAIN);
    }
  }

  public synchronizeUser(users: User[]) {
    try {
      this.users = {};

      for (const user of users) {
        this.users[user.address] = user;
      }
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_SYNCHRONIZE_CHAIN);
    }
  }

  public synchronizeTxMemPool(transactions: Transaction[]) {
    try {
      this.memPullTransactions = {};

      for (const tx of transactions) {
        this.memPullTransactions[tx?.hash] = tx;
        this.emit(EventMessage.TRANSACTION_ADD_IN_MEMPOOL, tx);
      }
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_SYNCHRONIZE_CHAIN);
    }
  }

  public async getBlockByHash(blockHash: string): Promise<IBlock> {
    try {
      const block = await this.db.blocks.findOne(blockHash);

      return block;
    } catch (e) {
      throw new BlockChainError(BlockChainErrorCodes.DOESNT_NOT_BLOCK_BY_HASH);
    }
  }

  public newCreatedBlock(block: IBlock) {
    try {
      this.pendingBlocks.push(block);
      this.emit(EventMessage.BLOCK_ADDED, block);
    } catch (e) {
      throw e;
    }
  }

  public async setNewBlockToChain(newBlockHash: string): Promise<boolean> {
    try {
      const block = this.pendingBlocks.filter(
        ({ hash }) => hash === newBlockHash
      )[0];

      if (!block) {
        throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
      }

      const key = block.hash;
      this.pendingBlocks = [];

      await this.db.blocks.create({ key, data: block });

      return true;
    } catch (e) {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_SYNCHRONIZE_CHAIN);
    }
  }

  public async setNewBlockToChainFromOtherNode(block: IBlock) {
    try {
      await this.db.blocks.create({ key: block.hash, data: block });
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_SYNCHRONIZE_CHAIN);
    }
  }

  public setNewUser(newUser: User): boolean {
    try {
      if (this.users[newUser.address]) {
        throw new Error();
      }

      this.users[newUser.address] = newUser;
      this.emit(EventMessage.USER_ADDED, newUser);

      return true;
    } catch {
      throw new BlockChainError(
        BlockChainErrorCodes.FAIL_SAVE_NEW_USER_TO_STORE
      );
    }
  }

  public getUserByAddress(address: string): User {
    try {
      const user = this.users[address];

      if (!user) {
        throw new Error();
      }

      return user;
    } catch (e) {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public getOriginalUserObject() {
    try {
      return this.users;
    } catch (e) {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public getAllUsers(): User[] {
    try {
      return Object.values(this.users);
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public setNewTransactionToMemPull(transaction: Transaction): boolean {
    try {
      if (this.memPullTransactions[transaction.hash]) {
        throw new Error();
      }

      this.memPullTransactions[transaction.hash] = transaction;

      this.emit(EventMessage.TRANSACTION_ADD_IN_MEMPOOL, transaction);

      return true;
    } catch (e) {
      console.log(e);
      throw new BlockChainError(
        BlockChainErrorCodes.FAIL_SAVE_TRANSACTION_TO_MEM_PULL
      );
    }
  }

  public getTransactionByHash(transactionHash: string): Transaction {
    try {
      const transaction = this.memPullTransactions[transactionHash];

      if (!transaction) throw new Error();

      return transaction;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public getAllTransactionsFromMemPull() {
    try {
      return Object.values(this.memPullTransactions);
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public updateUserBalance(publicKey: string, balance: string): boolean {
    try {
      const user = this.users[publicKey];

      if (!user) {
        throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
      }

      user.balance = balance;

      this.emit(EventMessage.UPDATE_USER_BALANCE, {
        userKey: publicKey,
        newBalance: balance,
      });

      return true;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public deleteTxFromMemPool(txHash: string): boolean {
    try {
      const tx = this.memPullTransactions[txHash];

      if (!tx) {
        throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
      }

      delete this.memPullTransactions[tx.hash];

      return true;
    } catch (e) {
      throw e;
    }
  }

  public async setVerifyBlockByHash(hash: string): Promise<IBlock> {
    try {
      const block = await this.getBlockByHash(hash);

      if (block.verify === true) {
        throw new Error();
      }

      block.verify = true;

      return block;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public setNewTxFromOtherNode(tx: Transaction) {
    try {
      const empty = this.memPullTransactions[tx.hash];

      if (empty) {
        throw new BlockChainError(BlockChainErrorCodes.DUPLICATE_DATA);
      }

      this.memPullTransactions[tx.hash] = tx;
    } catch (e) {
      throw e;
    }
  }

  public setNewUserFromOtherNode(user: User) {
    try {
      this.users[user.address] = user;
    } catch (e) {
      throw e;
    }
  }
}

export default new BlockChainStore();

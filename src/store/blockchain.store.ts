import EventEmitter from "events";

import { EventMessage } from "../constants";
import { BlockChainError, BlockChainErrorCodes } from "../errors";

import type { Transaction } from "@/transaction/transaction.interface";
import { IBlock } from "../block/block.interface";
import type { User } from "../user/user.interface";

class BlockChainStore extends EventEmitter {
  public chain: Record<IBlock["hash"], IBlock> = {};
  public users: Record<User["publicKey"], User> = {};
  public memPullTransactions: Record<Transaction["hash"], Transaction> = {};
  public pendingBlocks: IBlock[] = [];

  public getChain(): IBlock[] {
    try {
      return Object.values(this.chain);
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
        this.users[user.publicKey] = user;
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

  public getBlockByHash(blockHash: string): IBlock {
    try {
      const block = this.chain[blockHash];

      if (block) {
        return block;
      }

      throw new BlockChainError(BlockChainErrorCodes.DOESNT_NOT_BLOCK_BY_HASH);
    } catch (e) {
      throw e;
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

  public setNewBlockToChain(newBlockHash: string): boolean {
    try {
      const block = this.pendingBlocks.filter(
        ({ hash }) => hash === newBlockHash
      )[0];

      console.log(block);

      if (!block) {
        throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
      }

      this.chain[block.hash] = block;
      this.pendingBlocks = [];

      return true;
    } catch (e) {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_SYNCHRONIZE_CHAIN);
    }
  }

  public setNewBlockToChainFromOtherNode(block: IBlock) {
    try {
      this.chain[block.hash] = block;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_SYNCHRONIZE_CHAIN);
    }
  }

  public setNewUser(newUser: User): boolean {
    try {
      if (this.users[newUser.publicKey]) {
        throw new Error();
      }

      this.users[newUser.publicKey] = newUser;
      this.emit(EventMessage.USER_ADDED, newUser);

      return true;
    } catch {
      throw new BlockChainError(
        BlockChainErrorCodes.FAIL_SAVE_NEW_USER_TO_STORE
      );
    }
  }

  public getUserByPublicKey(publicKey: string): User {
    try {
      const user = this.users[publicKey];

      if (!user) {
        throw new Error();
      }

      return user;
    } catch {
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

  public setVerifyBlockByHash(hash: string): IBlock {
    try {
      const block = this.getBlockByHash(hash);

      if (block.verify === true) {
        throw new Error();
      }

      block.verify = true;

      return block;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }
}

export default new BlockChainStore();

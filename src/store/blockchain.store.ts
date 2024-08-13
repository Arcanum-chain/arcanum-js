import EventEmitter from "events";

import { EventMessage } from "../constants";
import { BlockChainError, BlockChainErrorCodes } from "../errors";

import type { Block } from "../block/block";
import type { BlockTransaction } from "../transaction/transaction";
import type { User } from "../user/user.interface";

class BlockChainStore extends EventEmitter {
  public chain: Map<Block["hash"], Block> = new Map();
  public users: Record<User["publicKey"], User> = {};
  public memPullTransactions: Map<BlockTransaction["hash"], BlockTransaction> =
    new Map();

  public synchronizeChain(newChain: Block[]) {
    try {
      this.chain.clear();

      for (const block of newChain) {
        this.chain.set(block.hash, block);
      }
    } catch (e) {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_SYNCHRONIZE_CHAIN);
    }
  }

  public getBlockByHash(blockHash: string): Block {
    try {
      const block = this.chain.get(blockHash);

      if (block) {
        return block;
      }

      throw new BlockChainError(BlockChainErrorCodes.DOESNT_NOT_BLOCK_BY_HASH);
    } catch (e) {
      throw e;
    }
  }

  public setNewBlockToChain(newBlock: Block) {
    try {
      this.chain.set(newBlock.hash, newBlock);
      this.emit(EventMessage.BLOCK_ADDED, newBlock);
    } catch (e) {
      console.log(e);
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

  public setNewTransactionToMemPull(transaction: BlockTransaction): boolean {
    try {
      if (this.memPullTransactions.get(transaction.hash)) {
        throw new Error();
      }

      this.memPullTransactions.set(transaction.hash, transaction);

      this.emit(EventMessage.TRANSACTION_ADD_IN_MEMPOOL, transaction);

      return true;
    } catch {
      throw new BlockChainError(
        BlockChainErrorCodes.FAIL_SAVE_TRANSACTION_TO_MEM_PULL
      );
    }
  }

  public getTransactionByHash(transactionHash: string): BlockTransaction {
    try {
      const transaction = this.memPullTransactions.get(transactionHash);

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
}

export default new BlockChainStore();

import EventEmitter from "events";

import { CocoAPI } from "../coconut-db/src/index";

import { EventMessage } from "../constants";
import { BlockChainError, BlockChainErrorCodes } from "../errors";

import type { Transaction, IBlock, User } from "../blockchain-common";

class BlockChainStore extends EventEmitter {
  public chain: Record<IBlock["hash"], IBlock> = {};
  public users: Record<User["address"], User> = {};
  public memPullTransactions: Record<Transaction["hash"], Transaction> = {};
  public pendingBlocks: IBlock[] = [];
  private readonly cocoApi: CocoAPI;

  constructor() {
    super();

    this.cocoApi = CocoAPI.getInstance();
  }

  public async addGenesisBlock(genesisBlock: IBlock) {
    try {
      let [checkData] =
        await this.cocoApi.getDataSource.meta.techMeta.findMany();

      if (checkData?.hasAlreadyGenesisBlock) {
        throw new BlockChainError(BlockChainErrorCodes.GENESIS_BLOCK_EXIST);
      }

      if (!checkData) {
        await this.cocoApi.getDataSource.meta.techMeta.create({
          key: "tech",
          data: { hasAlreadyGenesisBlock: true },
        });

        checkData = (
          await this.cocoApi.getDataSource.meta.techMeta.findMany()
        )[0];
      }

      await this.cocoApi.chainRepo.blocks.create({
        key: genesisBlock.hash,
        data: genesisBlock,
      });
    } catch (e) {
      throw e;
    }
  }

  public async getChain(): Promise<IBlock[]> {
    try {
      const start = new Date().getTime();

      const data = await this.cocoApi.chainRepo.blocks.findMany();
      const sortedData = data.sort((a, b) => b.index - a.index);

      const end = new Date().getTime();

      console.log("Время выполнения = " + (end - start));

      return sortedData;
    } catch (e) {
      console.log(e);
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

  public async synchronizeChain(newChain: IBlock[]) {
    try {
      await this.cocoApi.chainRepo.blocks.clearAllDatabase();

      for (const block of newChain) {
        await this.cocoApi.chainRepo.blocks.create({
          key: block.hash,
          data: block,
        });
      }
    } catch (e) {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_SYNCHRONIZE_CHAIN);
    }
  }

  public async synchronizeUser(users: User[]) {
    try {
      await this.cocoApi.chainRepo.users.clearAllDatabase();

      for (const user of users) {
        await this.cocoApi.chainRepo.users.create({
          key: user.address,
          data: user,
        });
      }
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_SYNCHRONIZE_CHAIN);
    }
  }

  public async synchronizeTxMemPool(transactions: Transaction[]) {
    try {
      await this.cocoApi.chainRepo.txs.clearAllDatabase();

      for (const tx of transactions) {
        await this.cocoApi.chainRepo.txs.create({
          key: tx?.hash,
          data: tx,
        });
        this.emit(EventMessage.TRANSACTION_ADD_IN_MEMPOOL, tx);
      }
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_SYNCHRONIZE_CHAIN);
    }
  }

  public async getBlockByHash(blockHash: string): Promise<IBlock> {
    try {
      const block = await this.cocoApi.chainRepo.blocks.findOne(blockHash);

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

      await this.cocoApi.chainRepo.blocks.create({ key, data: block });

      return true;
    } catch (e) {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_SYNCHRONIZE_CHAIN);
    }
  }

  public async setNewBlockToChainFromOtherNode(block: IBlock) {
    try {
      await this.cocoApi.chainRepo.blocks.create({
        key: block.hash,
        data: block,
      });
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_SYNCHRONIZE_CHAIN);
    }
  }

  public async setNewUser(newUser: User): Promise<boolean> {
    try {
      await this.cocoApi.chainRepo.users.create({
        key: newUser.address,
        data: newUser,
      });
      this.emit(EventMessage.USER_ADDED, newUser);

      return true;
    } catch (e) {
      throw new BlockChainError(
        BlockChainErrorCodes.FAIL_SAVE_NEW_USER_TO_STORE
      );
    }
  }

  public async getUserByAddress(address: string): Promise<User> {
    try {
      const user = await this.cocoApi.chainRepo.users.findOne(address);

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

  public async getAllUsers(): Promise<User[]> {
    try {
      const data = await this.cocoApi.chainRepo.users.findMany();

      return data;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public async setNewTransactionToMemPull(
    transaction: Transaction
  ): Promise<boolean> {
    try {
      if (this.memPullTransactions[transaction.hash]) {
        throw new Error();
      }

      await this.cocoApi.chainRepo.txs.create({
        key: transaction.hash,
        data: transaction,
      });
      this.emit(EventMessage.TRANSACTION_ADD_IN_MEMPOOL, transaction);

      return true;
    } catch {
      throw new BlockChainError(
        BlockChainErrorCodes.FAIL_SAVE_TRANSACTION_TO_MEM_PULL
      );
    }
  }

  public async getTransactionByHash(
    transactionHash: string
  ): Promise<Transaction> {
    try {
      const transaction = this.cocoApi.chainRepo.txs.findOne(transactionHash);

      if (!transaction) throw new Error();

      return transaction;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public async getAllTransactionsFromMemPull() {
    try {
      return await this.cocoApi.chainRepo.txs.findMany();
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public async updateUserBalance(
    address: string,
    balance: string
  ): Promise<boolean> {
    try {
      const user = await this.cocoApi.chainRepo.users.findOne(address);

      if (!user) {
        throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
      }

      await this.cocoApi.chainRepo.users.update({
        key: user.address,
        updateData: {
          balance: balance,
        },
      });

      return true;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public async deleteTxFromMemPool(txHash: string): Promise<boolean> {
    try {
      const hash = txHash.split("::")[1];

      if (!hash) {
        throw new Error(`Invalid tx hash, received ${txHash}`);
      }

      await this.cocoApi.chainRepo.txs.deleteOne({ static: hash });

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

  public async setNewTxFromOtherNode(tx: Transaction) {
    try {
      const empty = await this.cocoApi.chainRepo.txs.findOne(tx.hash);

      if (empty) {
        throw new BlockChainError(BlockChainErrorCodes.DUPLICATE_DATA);
      }

      await this.cocoApi.chainRepo.txs.create({ key: tx.hash, data: tx });
    } catch (e) {
      throw e;
    }
  }

  public async setNewUserFromOtherNode(user: User) {
    try {
      await this.cocoApi.chainRepo.users.create({
        key: user.address,
        data: user,
      });
    } catch (e) {
      throw e;
    }
  }
}

export default new BlockChainStore();

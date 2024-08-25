import { Singleton } from "../basic";
import { EventMessage } from "../constants";
import { BlockChainMessage } from "../utils";

import { BlockChainError, BlockChainErrorCodes } from "../errors";
import { SecurityAssistent } from "../security-assistent/security-assistent";
import { VerifyBlockService } from "../utils/verify.block.util.service";

import { BlockChainStore, MetadataBlockchainStore } from "../store";

import type { Transaction } from "@/transaction/transaction.interface";
import type { MessageEvent } from "../utils";

export class MemPool extends Singleton {
  private readonly store: typeof BlockChainStore = BlockChainStore;
  private readonly securityAssustent: SecurityAssistent;
  private readonly verifyHashService: VerifyBlockService;
  private readonly metaStore: typeof MetadataBlockchainStore =
    MetadataBlockchainStore;
  public memPoolLength: number = 0;
  public pendingTransactionsToBlock: Transaction[] = [];
  private isPendingBlock: boolean = false;

  constructor() {
    super();

    this.securityAssustent = new SecurityAssistent();
    this.verifyHashService = new VerifyBlockService();
    this.memPoolLength = this.store.getAllTransactionsFromMemPull().length;

    this.subscribe();
  }

  @BlockChainMessage(EventMessage.TRANSACTION_ADD_IN_MEMPOOL)
  private emitNewTransactionInPool(data?: MessageEvent<Transaction>) {
    try {
      const tx = data?.msg;

      if (!tx) throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);

      this.securityAssustent.usersExist(tx.data.sender, tx.data.to);
      this.verifyHashService.isHashValid(tx.hash);
      this.verifyHashService.isHashValid(tx.blockHash);
      this.verifyHashService.isHashProofed({
        hash: tx.blockHash,
        difficulty: this.metaStore.difficulty - 1,
      });

      this.memPoolLength += 1;
      this.sortedTransactionFromMemPool();
    } catch (e) {
      this.rollbackInValidTxFromMemPool(data?.msg?.hash as string);
      throw e;
    }
  }

  public addNewTxFromOtherNode(tx: Transaction) {
    try {
      this.store.setNewTxFromOtherNode(tx);
      this.sortedTransactionFromMemPool();
    } catch (e) {
      throw e;
    }
  }

  private rollbackInValidTxFromMemPool(txHash: string) {
    try {
      this.memPoolLength -= 1;
      return this.store.deleteTxFromMemPool(txHash);
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.BAD_DATA);
    }
  }

  public sortedTransactionFromMemPool() {
    try {
      const memPool = [...this.store.getAllTransactionsFromMemPull()];

      const dataPool = memPool.filter((tx) => {
        const currentTime = Date.now();

        const twentyHoursAgo = currentTime - 20 * 60 * 60 * 1000;

        return tx.data.timestamp > twentyHoursAgo;
      });

      const sortedTxByFee = dataPool.sort((a, b) => b.fee - a.fee);

      const takeHundredEl = sortedTxByFee.slice(-100);

      this.pendingTransactionsToBlock = takeHundredEl;

      return takeHundredEl;
    } catch (e) {
      throw e;
    }
  }

  public getPendingTxsToMineBlock() {
    try {
      this.isPendingBlock = true;
      return this.pendingTransactionsToBlock;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public deletePendingTxPollToConfirmMineBlock() {
    try {
      if (this.isPendingBlock) {
        this.pendingTransactionsToBlock.forEach((tx) => {
          this.store.deleteTxFromMemPool(tx.hash);
        });

        this.pendingTransactionsToBlock = [];
        this.isPendingBlock = false;
      }
    } catch (e) {
      throw e;
    }
  }

  private subscribe() {
    try {
      this.emitNewTransactionInPool();
    } catch (e) {
      throw e;
    }
  }
}

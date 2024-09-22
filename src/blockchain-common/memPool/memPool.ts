import { Singleton } from "../../basic";
import { EventMessage } from "../../constants";
import { BlockChainMessage } from "../../utils";

import { BlockChainError, BlockChainErrorCodes } from "../../errors";
import { SecurityAssistent } from "../../blockchain-safety/security-assistent/security-assistent";
import { VerifyBlockService } from "../../utils/verify.block.util.service";

import { BlockChainStore, MetadataBlockchainStore } from "../../store";

import type { Transaction } from "../index";
import type { MessageEvent } from "../../utils";

export class MemPool extends Singleton {
  private readonly store: typeof BlockChainStore = BlockChainStore;
  private readonly securityAssustent: SecurityAssistent;
  private readonly verifyHashService: VerifyBlockService;
  private readonly metaStore: typeof MetadataBlockchainStore =
    MetadataBlockchainStore;
  public pendingTransactionsToBlock: Transaction[] = [];
  private isPendingBlock: boolean = false;
  private memPoolLength: number = 0;

  constructor() {
    super();

    this.securityAssustent = new SecurityAssistent();
    this.verifyHashService = new VerifyBlockService();

    this.subscribe();
  }

  @BlockChainMessage(EventMessage.TRANSACTION_ADD_IN_MEMPOOL)
  private async emitNewTransactionInPool(data?: MessageEvent<Transaction>) {
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
      await this.sortedTransactionFromMemPool();
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

  public async sortedTransactionFromMemPool() {
    try {
      const memPool = await this.store.getAllTransactionsFromMemPull();

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

  public async getPendingTxsToMineBlock() {
    try {
      this.isPendingBlock = true;
      await this.sortedTransactionFromMemPool();
      return this.pendingTransactionsToBlock;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public async deletePendingTxPollToConfirmMineBlock() {
    try {
      if (this.isPendingBlock) {
        await Promise.all(
          this.pendingTransactionsToBlock.map(async (tx) => {
            return await this.store.deleteTxFromMemPool(tx.hash);
          })
        );

        this.pendingTransactionsToBlock = [];
        this.isPendingBlock = false;
      }
    } catch (e) {
      throw e;
    }
  }

  private async subscribe() {
    try {
      await this.emitNewTransactionInPool();
      this.memPoolLength = (
        await this.store.getAllTransactionsFromMemPull()
      ).length;
    } catch (e) {
      throw e;
    }
  }
}

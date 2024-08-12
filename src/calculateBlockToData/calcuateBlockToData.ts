import { BlockLimits } from "../constants/block.limits";

import { Block } from "../block/block";
import { BlockTransaction } from "../transaction/transaction";
import type { CalculateBlockToDataConstructor } from "./calculateBlockToData.interface";

export class CalculateBlockToData {
  private readonly blockChain: Block[];
  public lastBlockToFullTransactionsIndex = 0;
  public mimePullTransactions: Record<string, BlockTransaction>;

  constructor({ blockChain }: CalculateBlockToDataConstructor) {
    this.blockChain = blockChain;
    this.mimePullTransactions = {};

    if (this) {
      return this;
    }
  }

  private calculateBlockToTransaction(
    transaction: BlockTransaction
  ): undefined | Block {
    try {
      const curTransaction = transaction;

      for (
        let i = this.lastBlockToFullTransactionsIndex;
        i < this.blockChain.length;
        i++
      ) {
        const block = this.blockChain[i];
        if (
          Object.values(block.data.transactions).length <
          BlockLimits.MAX_TRANSACTION_COUNT
        ) {
          this.lastBlockToFullTransactionsIndex = i;
          return block; // Вернуть блок, куда можно добавить транзакцию
        }
      }

      if (
        Object.keys(
          this.blockChain[this.blockChain.length - 1].data.transactions
        ).length < BlockLimits.MAX_TRANSACTION_COUNT
      ) {
        return this.blockChain[this.blockChain.length - 1];
      }

      if (!this.mimePullTransactions[curTransaction.hash]) {
        this.mimePullTransactions[curTransaction.hash] = curTransaction;
      }

      return undefined;
    } catch (e) {
      throw e;
    }
  }

  public mutateBlockToAddTransaction(transaction: BlockTransaction) {
    try {
      const block = this.calculateBlockToTransaction(transaction);

      if (block) {
        transaction.blockHash = block.hash;
        transaction.indexBlock = block.index;
        const data = transaction.createTransaction();
        transaction.transfer();
        this.blockChain[block.index].data.transactions[transaction.hash] = data;

        return data;
      } else {
        return false;
      }
    } catch (e) {
      throw e;
    }
  }

  public emitNewTransactionToPull() {
    try {
      Object.values(this.mimePullTransactions).forEach((transaction) => {
        const block = this.calculateBlockToTransaction(transaction);

        if (block) {
          transaction.blockHash = block.hash;
          transaction.indexBlock = block.index;
          const data = transaction.createTransaction();
          transaction.transfer();
          this.blockChain[block.index].data.transactions[transaction.hash] =
            data;
          delete this.mimePullTransactions[transaction.hash];
        }
      });
    } catch (e) {
      throw e;
    }
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculateBlockToData = void 0;
const block_limits_1 = require("../constants/block.limits");
class CalculateBlockToData {
    constructor({ blockChain }) {
        this.lastBlockToFullTransactionsIndex = 0;
        this.blockChain = blockChain;
        this.mimePullTransactions = {};
        if (this) {
            return this;
        }
    }
    calculateBlockToTransaction(transaction) {
        try {
            const curTransaction = transaction;
            for (let i = this.lastBlockToFullTransactionsIndex; i < this.blockChain.length; i++) {
                const block = this.blockChain[i];
                if (Object.values(block.data.transactions).length <
                    block_limits_1.BlockLimits.MAX_TRANSACTION_COUNT) {
                    this.lastBlockToFullTransactionsIndex = i;
                    return block;
                }
            }
            if (Object.keys(this.blockChain[this.blockChain.length - 1].data.transactions).length < block_limits_1.BlockLimits.MAX_TRANSACTION_COUNT) {
                return this.blockChain[this.blockChain.length - 1];
            }
            if (!this.mimePullTransactions[curTransaction.hash]) {
                this.mimePullTransactions[curTransaction.hash] = curTransaction;
            }
            return undefined;
        }
        catch (e) {
            throw e;
        }
    }
    mutateBlockToAddTransaction(transaction) {
        try {
            const block = this.calculateBlockToTransaction(transaction);
            if (block) {
                transaction.blockHash = block.hash;
                transaction.indexBlock = block.index;
                const data = transaction.createTransaction();
                transaction.transfer();
                this.blockChain[block.index].data.transactions[transaction.hash] = data;
                return data;
            }
            else {
                return false;
            }
        }
        catch (e) {
            throw e;
        }
    }
    emitNewTransactionToPull() {
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
        }
        catch (e) {
            throw e;
        }
    }
}
exports.CalculateBlockToData = CalculateBlockToData;
//# sourceMappingURL=calcuateBlockToData.js.map
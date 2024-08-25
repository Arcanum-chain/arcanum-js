"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiningBlock = void 0;
const coinBaseTransaction_1 = require("../coinBaseTransaction/coinBaseTransaction");
const constants_1 = require("../constants");
const memPool_1 = require("../memPool/memPool");
const store_1 = require("../store");
const transactionActions_1 = require("../transaction/transactionActions");
const utils_1 = require("../utils");
class MiningBlock {
    constructor(minerAddress) {
        this.minerAddress = minerAddress;
        this.powPrefix = constants_1.BlockLimits.DEFAULT_HASH_PREFIX;
        this.metadataStore = store_1.MetadataBlockchainStore;
        this.store = store_1.BlockChainStore;
        this.verifyBlockService = new utils_1.VerifyBlockService();
        this.memPool = memPool_1.MemPool.getInstance();
        this.txActions = new transactionActions_1.TransactionActions();
        this.merkleTreeService = new utils_1.MerkleTree();
    }
    mineBlock(block) {
        try {
            let nonce = 0;
            this.calculateDifficulty();
            while (true) {
                const blockHash = block.calculateHash();
                const proofingHash = this.verifyBlockService.genHash(blockHash + nonce);
                if (this.verifyBlockService.isHashProofed({
                    hash: proofingHash,
                    difficulty: this.metadataStore.getDifficulty,
                    prefix: this.powPrefix,
                }) &&
                    this.store.getPendingBlocks().length === 0) {
                    block.hash = `${constants_1.DEFAULT_HASH_PREFIX}${proofingHash}`;
                    block.data.blockHash = `${constants_1.DEFAULT_HASH_PREFIX}${proofingHash}`;
                    block.index =
                        this.store.getChain()[this.store.getChain().length - 1].index + 1;
                    return this.appendCoinBaseTx(block);
                }
                nonce++;
            }
        }
        catch (e) {
            throw e;
        }
    }
    calculateTxsMerkleRoot() {
        try {
            const txs = this.memPool.getPendingTxsToMineBlock();
            const { root } = this.merkleTreeService.buildTxsMerkleTree(txs);
            return { rootHash: root, transactions: txs };
        }
        catch (e) {
            throw e;
        }
    }
    appendTxsToBlock(block) {
        try {
            if (block.index !== 0) {
                const { rootHash, transactions } = this.calculateTxsMerkleRoot();
                block.data.txMerkleRoot = rootHash;
                let totalFeeRei = 0;
                transactions.forEach((tx) => {
                    block.data.transactions[tx.hash] = tx;
                    totalFeeRei += tx.fee;
                });
                block.totalFeeRei = totalFeeRei;
                this.memPool.deletePendingTxPollToConfirmMineBlock();
            }
        }
        catch (e) {
            throw e;
        }
    }
    appendCoinBaseTx(block) {
        try {
            const tx = new coinBaseTransaction_1.CoinBaseTransaction({
                blockHash: block.hash,
                timestamp: Date.now(),
                minerAddress: this.minerAddress,
            });
            block.data.coinBase = tx.createCoinBaseTx();
            this.appendTxsToBlock(block);
            return block;
        }
        catch (e) {
            throw e;
        }
    }
    calculateDifficulty() {
        var _a, _b;
        try {
            const lastBlockTimestamp = (_b = (_a = this.store.getChain()[this.store.getChain().length - 1]) === null || _a === void 0 ? void 0 : _a.timestamp) !== null && _b !== void 0 ? _b : Date.now();
            const currentTimestamp = Date.now();
            const timeTaken = currentTimestamp - lastBlockTimestamp;
            if (timeTaken < constants_1.BlockLimits.MAX_MINING_TIME / 2) {
                this.metadataStore.difficulty += 1;
            }
            else if (timeTaken > constants_1.BlockLimits.MAX_MINING_TIME * 2) {
                this.metadataStore.difficulty -= 1;
            }
            return this.metadataStore.getDifficulty;
        }
        catch (e) {
            throw e;
        }
    }
}
exports.MiningBlock = MiningBlock;
//# sourceMappingURL=mining.js.map
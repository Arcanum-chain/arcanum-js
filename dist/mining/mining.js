"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiningBlock = void 0;
const constants_1 = require("../constants");
const store_1 = require("../store");
const verify_block_util_service_1 = require("../utils/verify.block.util.service");
class MiningBlock {
    constructor() {
        this.powPrefix = constants_1.BlockLimits.DEFAULT_HASH_PREFIX;
        this.metadataStore = store_1.MetadataBlockchainStore;
        this.store = store_1.BlockChainStore;
        this.verifyBlockService = new verify_block_util_service_1.VerifyBlockService();
    }
    mineBlock(block) {
        try {
            let nonce = 0;
            this.calculateDifficulty();
            console.log("Block to mine:", block);
            while (true) {
                const blockHash = block.calculateHash();
                const proofingHash = this.verifyBlockService.genHash(blockHash + nonce);
                if (this.verifyBlockService.isHashProofed({
                    hash: proofingHash,
                    difficulty: this.metadataStore.getDifficulty,
                    prefix: this.powPrefix,
                })) {
                    block.hash = `${constants_1.DEFAULT_HASH_PREFIX}${proofingHash}`;
                    block.data.blockHash = `${constants_1.DEFAULT_HASH_PREFIX}${proofingHash}`;
                    block.index =
                        this.store.getChain()[this.store.getChain().length - 1].index + 1;
                    return block;
                }
                nonce++;
            }
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
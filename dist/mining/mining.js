"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiningBlock = void 0;
const constants_1 = require("../constants");
const verify_block_util_service_1 = require("../utils/verify.block.util.service");
class MiningBlock {
    constructor(chain) {
        this.chain = chain;
        this.difficulty = constants_1.BlockLimits.MIN_DIFFICULTY;
        this.powPrefix = constants_1.BlockLimits.DEFAULT_HASH_PREFIX;
        this.verifyBlockService = new verify_block_util_service_1.VerifyBlockService();
        if (this) {
            return this;
        }
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
                    difficulty: this.difficulty,
                    prefix: this.powPrefix,
                })) {
                    block.hash = `${constants_1.DEFAULT_HASH_PREFIX}${proofingHash}`;
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
        try {
            console.log(this.chain);
            const lastBlockTimestamp = this.chain[this.chain.length - 1].timestamp;
            const currentTimestamp = Date.now();
            const timeTaken = currentTimestamp - lastBlockTimestamp;
            if (timeTaken < constants_1.BlockLimits.MAX_MINING_TIME / 2) {
                this.difficulty += 1;
            }
            else if (timeTaken > constants_1.BlockLimits.MAX_MINING_TIME * 2) {
                this.difficulty -= 1;
            }
            return this.difficulty;
        }
        catch (e) {
            throw e;
        }
    }
}
exports.MiningBlock = MiningBlock;
//# sourceMappingURL=mining.js.map
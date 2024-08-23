"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockLimits = void 0;
var BlockLimits;
(function (BlockLimits) {
    BlockLimits[BlockLimits["MAX_TRANSACTION_COUNT"] = 100] = "MAX_TRANSACTION_COUNT";
    BlockLimits[BlockLimits["MAX_MINING_TIME"] = 600000] = "MAX_MINING_TIME";
    BlockLimits[BlockLimits["MIN_DIFFICULTY"] = 0] = "MIN_DIFFICULTY";
    BlockLimits["DEFAULT_HASH_PREFIX"] = "0";
    BlockLimits[BlockLimits["MAX_DIFFICULTY"] = 1000] = "MAX_DIFFICULTY";
    BlockLimits[BlockLimits["START_BLOCK_MINING_REWARD"] = 300000000000] = "START_BLOCK_MINING_REWARD";
})(BlockLimits || (exports.BlockLimits = BlockLimits = {}));
//# sourceMappingURL=block.limits.js.map
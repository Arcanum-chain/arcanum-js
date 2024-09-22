"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyBlockService = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const js_sha3_1 = require("js-sha3");
const errors_1 = require("../errors");
const default_hash_prefix_1 = require("../constants/default.hash.prefix");
class VerifyBlockService {
    isHashProofed({ hash, difficulty = 5, prefix = "0", }) {
        try {
            const check = prefix.repeat(difficulty);
            return hash.startsWith(check);
        }
        catch (e) {
            throw e;
        }
    }
    isHashValid(hash) {
        try {
            if (hash.startsWith(default_hash_prefix_1.DEFAULT_HASH_PREFIX)) {
                return true;
            }
            throw new errors_1.BlockChainError(errors_1.BlockChainErrorCodes.INVALID_HASH_BLOCK);
        }
        catch (e) {
            throw e;
        }
    }
    genHash(data) {
        try {
            return (0, js_sha3_1.keccak256)(node_crypto_1.default.createHash("sha256").update(data).digest("hex"));
        }
        catch (e) {
            throw e;
        }
    }
}
exports.VerifyBlockService = VerifyBlockService;
//# sourceMappingURL=verify.block.util.service.js.map
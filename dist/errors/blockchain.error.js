"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockChainError = void 0;
const blockchain_code_errors_1 = require("./blockchain.code.errors");
class BlockChainError extends Error {
    constructor(code) {
        super(blockchain_code_errors_1.BlockChainTextError[code]);
        this.code = code;
    }
}
exports.BlockChainError = BlockChainError;
//# sourceMappingURL=blockchain.error.js.map
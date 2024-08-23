"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = void 0;
const node_crypto_1 = require("node:crypto");
const default_hash_prefix_1 = require("../constants/default.hash.prefix");
class Block {
    constructor({ index, timestamp, data, prevBlockHash = "", }) {
        this.prevBlockHash = "";
        this.hash = "";
        this.verify = false;
        this.index = index;
        this.timestamp = timestamp;
        this.prevBlockHash = prevBlockHash;
        this.hash = this.calculateHash();
        this.data = Object.assign(Object.assign({}, data), { blockHash: this.hash });
    }
    calculateHash() {
        const payload = JSON.stringify({
            index: this.index,
            timestamp: this.timestamp,
            prevBlockHash: this.prevBlockHash,
            data: JSON.stringify(this.data),
        });
        const hash = `${default_hash_prefix_1.DEFAULT_HASH_PREFIX}${(0, node_crypto_1.createHash)("sha256")
            .update(payload)
            .digest("hex")}`;
        this.hash = hash;
        return hash;
    }
}
exports.Block = Block;
//# sourceMappingURL=block.js.map
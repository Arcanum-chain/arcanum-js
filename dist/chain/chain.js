"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockChain = void 0;
const ws_1 = __importDefault(require("ws"));
const store_1 = require("../store");
const block_1 = require("../block/block");
const calcuateBlockToData_1 = require("../calculateBlockToData/calcuateBlockToData");
const mining_1 = require("../mining/mining");
const transaction_1 = require("../transaction/transaction");
const user_1 = require("../user/user");
const verify_block_util_service_1 = require("../utils/verify.block.util.service");
const default_hash_prefix_1 = require("../constants/default.hash.prefix");
const peers_constanrs_1 = require("../constants/peers.constanrs");
class BlockChain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.users = {};
        this.store = store_1.BlockChainStore;
        this.chain = peers_constanrs_1.IS_MAIN_NODE ? [] : [];
        this.peers = peers_constanrs_1.PEERS;
        this.broadcastBlock = this.broadcastBlock.bind(this);
        this.users = {};
        this.blockChainUser = new user_1.BlockChainUser(this.users);
        this.verifyBlockService = new verify_block_util_service_1.VerifyBlockService();
        this.calculateRandomBlockToData = new calcuateBlockToData_1.CalculateBlockToData({
            blockChain: this.chain,
        });
        if (this) {
            return this;
        }
    }
    createGenesisBlock() {
        const blockData = {
            transactions: {},
        };
        const payload = {
            index: 0,
            timestamp: Date.now(),
            prevBlockHash: "",
            data: blockData,
        };
        const block = new block_1.Block(payload);
        this.store.setNewBlockToChain(block);
        this.chain.push(block);
        return block;
    }
    getChain() {
        try {
            return this.store.getChain();
        }
        catch (e) {
            throw e;
        }
    }
    getLatestBlock() {
        return this.store.getChain()[this.store.getChain().length - 1];
    }
    getBlockByHash(blockHash) {
        return this.chain[0];
    }
    isValidChain(chain) {
        for (let i = 1; i < chain.length; i++) {
            const currentBlock = chain[i];
            const previousBlock = chain[i - 1];
            if (currentBlock.prevBlockHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
    mineBlock() {
        var _a, _b, _c;
        const payload = {
            index: ((_a = this.getLatestBlock()) === null || _a === void 0 ? void 0 : _a.index) + 1,
            timestamp: Date.now(),
            data: {
                transactions: {},
            },
            prevBlockHash: (_c = (_b = this.getLatestBlock()) === null || _b === void 0 ? void 0 : _b.hash) !== null && _c !== void 0 ? _c : "",
        };
        const newBlock = new block_1.Block(payload);
        new mining_1.MiningBlock().mineBlock(newBlock);
        this.chain.push(newBlock);
        this.store.setNewBlockToChain(newBlock);
        const isValidChain = this.isValidChain(this.chain);
        if (isValidChain) {
            return newBlock;
        }
        else if (!isValidChain) {
            return new Error("Not valid chain!!!!");
        }
    }
    replaceChain(newChain) {
        if (newChain.length > this.chain.length && this.isValidChain(newChain)) {
            this.chain = newChain;
            console.log("Новая цепочка блоков принята");
        }
        else {
            console.log("Новая цепочка блоков недействительна");
        }
    }
    broadcastBlock(block) {
        var _a;
        const peers = (_a = this.peers) !== null && _a !== void 0 ? _a : peers_constanrs_1.PEERS;
        peers.forEach((peer) => {
            const ws = new ws_1.default(peer);
            ws.on("open", () => {
                ws.send(JSON.stringify({ type: "block", data: block }));
            });
        });
    }
    broadcastUser(user) {
        var _a;
        try {
            const peers = (_a = this.peers) !== null && _a !== void 0 ? _a : peers_constanrs_1.PEERS;
            peers.forEach((peer) => {
                const ws = new ws_1.default(peer);
                ws.on("open", () => {
                    ws.send(JSON.stringify({ type: "user", data: user }));
                });
            });
        }
        catch (e) {
            throw e;
        }
    }
    createTransaction({ sender, to, amount, signature, }) {
        try {
            const transaction = new transaction_1.BlockTransaction({
                sender,
                amount,
                timestamp: Date.now(),
                to,
                indexBlock: 0,
                blockHash: this.chain[this.chain.length - 1].hash,
                users: this.users,
                signature,
            });
            const result = this.calculateRandomBlockToData.mutateBlockToAddTransaction(transaction);
            return result;
        }
        catch (e) {
            throw e;
        }
    }
    addNewUserToChain(newUsers) {
        try {
            const isEmptyUser = this.users[newUsers.publicKey];
            if (isEmptyUser) {
                throw new Error("Пользователь уже существует");
            }
            if (!newUsers.publicKey.startsWith(default_hash_prefix_1.DEFAULT_HASH_PREFIX)) {
                throw new Error("Invalid hash");
            }
            this.store.setNewUser(newUsers);
            return true;
        }
        catch (e) {
            throw e;
        }
    }
    createNewUser() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.blockChainUser.createNewUser();
                return data;
            }
            catch (e) {
                throw e;
            }
        });
    }
    getUserBalance(address) {
        try {
            return this.blockChainUser.getUserBalance(address);
        }
        catch (e) {
            throw e;
        }
    }
    getAllUsers() {
        return this.store.getAllUsers();
    }
    minerReward(minerAddress) {
        try {
        }
        catch (e) {
            throw e;
        }
    }
}
exports.BlockChain = BlockChain;
//# sourceMappingURL=chain.js.map
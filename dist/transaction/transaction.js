"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockTransaction = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const constants_1 = require("../constants");
const gas_1 = require("../gas/gas");
const convert_la_service_util_1 = require("../utils/convert.la.service.util");
const encode_service_util_1 = require("../utils/encode.service.util");
class BlockTransaction {
    constructor({ sender, to, amount, indexBlock, blockHash, users, timestamp, }) {
        this.users = {};
        this.sender = sender;
        this.to = to;
        this.amount = amount;
        this.hash = this.createTransactionHash();
        this.indexBlock = indexBlock;
        this.blockHash = blockHash;
        this.encodeService = new encode_service_util_1.EncodeUtilService();
        this.convertLaService = new convert_la_service_util_1.ConvertToLaService();
        this.gasService = new gas_1.BlockChainGas(0.5);
        this.users = users;
        this.timestamp = timestamp;
    }
    createTransactionHash() {
        const data = JSON.stringify({
            sender: this.sender,
            to: this.to,
            amount: this.amount,
            blockHash: this.blockHash,
            timestamp: this.timestamp,
            indexBlock: this.indexBlock,
        });
        const key = `${this.sender}`;
        const transactionHash = node_crypto_1.default
            .createHmac("sha256", key)
            .update(data)
            .digest();
        return `${constants_1.DEFAULT_HASH_PREFIX}${transactionHash.toString("hex")}`;
    }
    createTransaction() {
        try {
            const payload = {
                blockHash: this.blockHash,
                indexBlock: this.indexBlock,
                sender: this.sender,
                to: this.to,
                amount: this.amount,
                timestamp: this.timestamp,
                users: this.users,
            };
            const data = this.encodeService.encodeTransactionData(payload);
            return { data, blockHash: this.blockHash, hash: this.hash };
        }
        catch (e) {
            throw e;
        }
    }
    transfer() {
        try {
            const { sender, to } = this.checkTransferUsers(this.sender, this.to);
            const senderBal = +this.convertLaService.toLa(sender.balance);
            const laAmount = +this.convertLaService.toLa(this.amount.toString());
            const { updatedSenderBal, gas } = this.createCommission(senderBal);
            this.require(updatedSenderBal >= laAmount, "Insufficient funds");
            const newSenderBalance = this.convertLaService.toRei(String(+this.convertLaService.toLa(this.users[sender.publicKey].balance) -
                (laAmount + gas)));
            const newToBalance = this.convertLaService.toRei(String(+this.convertLaService.toLa(this.users[to.publicKey].balance) +
                laAmount));
            this.users[sender.publicKey].balance = newSenderBalance;
            this.users[to.publicKey].balance = newToBalance.toString();
            return true;
        }
        catch (e) {
            throw e;
        }
    }
    checkTransferUsers(senderAdr, toAdr) {
        try {
            const sender = this.users[senderAdr];
            this.require(sender !== undefined, "Sender not found");
            const to = this.users[toAdr];
            this.require(to !== undefined, "Participient not found");
            return { sender, to };
        }
        catch (e) {
            throw e;
        }
    }
    createCommission(senderBal) {
        try {
            const gas = this.gasService.calculateGasPrice(constants_1.BASIC_CONVERT_VALUES_ENUM.LA);
            console.log(senderBal, gas);
            if (senderBal <= gas) {
                throw new Error("It is impossible to pay for gas transactions");
            }
            return { updatedSenderBal: senderBal - gas, gas: gas };
        }
        catch (e) {
            throw e;
        }
    }
    require(logic, msg) {
        try {
            if (logic) {
                return true;
            }
            throw new Error(msg);
        }
        catch (e) {
            throw e;
        }
    }
}
exports.BlockTransaction = BlockTransaction;
//# sourceMappingURL=transaction.js.map
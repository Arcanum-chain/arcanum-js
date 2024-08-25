"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockTransaction = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const constants_1 = require("../constants");
const errors_1 = require("../errors");
const gas_1 = require("../gas/gas");
const store_1 = require("../store");
const convert_la_service_util_1 = require("../utils/convert.la.service.util");
const encode_service_util_1 = require("../utils/encode.service.util");
const keys_service_util_1 = require("../utils/keys.service.util");
const transactionActions_1 = require("./transactionActions");
class BlockTransaction {
    constructor({ sender, to, amount, indexBlock, blockHash, users, timestamp, signature, }) {
        this.users = {};
        this.fee = 0;
        this.store = store_1.BlockChainStore;
        this.sender = sender;
        this.to = to;
        this.amount = amount;
        this.indexBlock = indexBlock;
        this.blockHash = blockHash;
        this.encodeService = new encode_service_util_1.EncodeUtilService();
        this.convertLaService = new convert_la_service_util_1.ConvertToLaService();
        this.gasService = new gas_1.BlockChainGas(0.5);
        this.users = users;
        this.timestamp = timestamp;
        this.keyService = new keys_service_util_1.KeyService();
        this.signature = signature;
        this.hash = this.createTransactionHash();
        this.txActions = new transactionActions_1.TransactionActions();
        this.calculateFee();
        this.validate();
    }
    createTransactionHash() {
        const data = JSON.stringify({
            sender: this.sender,
            to: this.to,
            amount: this.amount,
            blockHash: this.blockHash,
            timestamp: this.timestamp,
            indexBlock: this.indexBlock,
            signature: this.signature,
        });
        const key = `${this.sender}`;
        const transactionHash = node_crypto_1.default
            .createHash("sha256")
            .update(node_crypto_1.default.createHmac("sha256", key).update(data).digest())
            .digest();
        return `${constants_1.DEFAULT_HASH_PREFIX}${transactionHash.toString("hex")}`;
    }
    createTransaction() {
        try {
            const payload = {
                sender: this.sender,
                to: this.to,
                amount: this.amount,
                timestamp: this.timestamp,
            };
            const verifyData = JSON.stringify({
                sender: this.sender,
                to: this.to,
                amount: this.amount,
            });
            this.verifySign(verifyData, this.signature, this.sender);
            return {
                data: payload,
                blockHash: this.blockHash,
                hash: this.hash,
                fee: this.fee,
            };
        }
        catch (e) {
            throw e;
        }
    }
    calculateFee() {
        try {
            const fee = this.gasService.calculateGasPrice("rei");
            this.fee = fee;
            return fee;
        }
        catch (e) {
            throw e;
        }
    }
    verifySign(data, signature, publicKey) {
        try {
            const publicKeyWithHeaders = this.keyService.addHeadersToKey(publicKey, "PUBLIC");
            const verifier = node_crypto_1.default.createVerify("sha256");
            verifier.update(data);
            verifier.end();
            const isValid = verifier.verify(publicKeyWithHeaders, Buffer.from(signature, "base64"));
            if (!isValid) {
                throw new errors_1.BlockChainError(errors_1.BlockChainErrorCodes.INVALID_VERIFY_TRANSACTION);
            }
            else {
                return true;
            }
        }
        catch (e) {
            console.log(e);
            throw new errors_1.BlockChainError(errors_1.BlockChainErrorCodes.INVALID_VERIFY_TRANSACTION);
        }
    }
    createCommission(senderBal) {
        try {
            const gas = this.gasService.calculateGasPrice(constants_1.BASIC_CONVERT_VALUES_ENUM.LA);
            if (senderBal <= gas) {
                throw new Error("It is impossible to pay for gas transactions");
            }
            return { updatedSenderBal: senderBal - gas, gas: gas };
        }
        catch (e) {
            throw e;
        }
    }
    validate() {
        try {
            this.txActions.checkTransferUsers(this.sender, this.to);
            const sender = this.store.getUserByPublicKey(this.sender);
            const { updatedSenderBal, gas } = this.createCommission(+this.convertLaService.toLa(sender.balance));
            const laAmount = +this.convertLaService.toLa(String(this.amount));
            this.fee = +this.convertLaService.toRei(String(gas));
            this.txActions.require(updatedSenderBal >= laAmount, "Insufficient funds");
        }
        catch (e) {
            throw e;
        }
    }
}
exports.BlockTransaction = BlockTransaction;
//# sourceMappingURL=transaction.js.map
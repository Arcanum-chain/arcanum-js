"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncodeUtilService = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const default_hash_prefix_1 = require("../constants/default.hash.prefix");
class EncodeUtilService {
    encodeUserSecret(dto) {
        try {
            const data = JSON.stringify({
                privateKey: dto.privateKey.substring(5).split("").reverse().join(""),
                sedCode: dto.sedCode.split("").reverse().join(""),
            });
            const encodeVal = btoa(data);
            const encodeValueString = [...new TextEncoder().encode(encodeVal)]
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
            return encodeValueString;
        }
        catch (e) {
            throw e;
        }
    }
    decodeUserSecret(encodeValueString, sedCode) {
        try {
            const decodedString = encodeValueString
                .match(/.{1,2}/g)
                .map((e) => String.fromCharCode(parseInt(e, 16)))
                .join("");
            const decodedValue = atob(decodedString).toString();
            const normalizeData = JSON.parse(decodedValue);
            const userSecretData = {
                privateKey: `${default_hash_prefix_1.DEFAULT_HASH_PREFIX}${normalizeData.privateKey
                    .split("")
                    .reverse()
                    .join("")}`,
                sedCode: normalizeData.sedCode.split("").reverse().join(""),
            };
            if (userSecretData.sedCode !== sedCode) {
                throw new Error("Permission denied");
            }
            return userSecretData;
        }
        catch (e) {
            throw e;
        }
    }
    encodeTransactionData(dto) {
        try {
            const data = JSON.stringify(Object.assign(Object.assign({}, dto), { to: dto.to.split("").reverse().join(""), sender: dto.sender.split("").reverse().join("") }));
            const encodeVal = btoa(data);
            const encodeValueString = [...new TextEncoder().encode(encodeVal)]
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
            const cipher = node_crypto_1.default.createCipheriv("aes-256-cbc", Buffer.from(dto.blockHash.substring(default_hash_prefix_1.DEFAULT_HASH_PREFIX.length), "hex"), default_hash_prefix_1.CLASSIC_IV_TRANSACTION);
            cipher.setEncoding("hex");
            const encrypt = cipher.update(encodeValueString);
            const encrypted = Buffer.concat([encrypt, cipher.final()]);
            return `${default_hash_prefix_1.DEFAULT_HASH_PREFIX}${encrypted.toString("hex")}`;
        }
        catch (e) {
            throw e;
        }
    }
    decodeTransactionData(encodeValueString, blockHash) {
        try {
            const decipher = node_crypto_1.default.createDecipheriv("aes-256-cbc", Buffer.from(blockHash.substring(default_hash_prefix_1.DEFAULT_HASH_PREFIX.length), "hex"), default_hash_prefix_1.CLASSIC_IV_TRANSACTION);
            const blockSize = 16;
            const decryptedParts = [];
            for (let i = 0; i < encodeValueString.length; i += blockSize) {
                const block = encodeValueString.substring(i, i + blockSize);
                const decryptedPart = decipher.update(block, "hex", "utf-8");
                decryptedParts.push(decryptedPart);
            }
            const finalDecrypted = decipher.final("utf-8");
            decryptedParts.push(finalDecrypted);
            const decryptedDataDirty = decryptedParts.join("");
            const decodedString = decryptedDataDirty
                .match(/.{1,2}/g)
                .map((e) => String.fromCharCode(parseInt(e, 16)))
                .join("");
            const decodedValue = atob(decodedString).toString();
            const normalizeData = JSON.parse(decodedValue);
            const decodeData = Object.assign(Object.assign({}, normalizeData), { sender: `${normalizeData.sender.split("").reverse().join("")}`, to: normalizeData.to.split("").reverse().join("") });
            if (decodeData.blockHash !== blockHash) {
                throw new Error("Permission denied");
            }
            return decodeData;
        }
        catch (e) {
            throw e;
        }
    }
}
exports.EncodeUtilService = EncodeUtilService;
//# sourceMappingURL=encode.service.util.js.map
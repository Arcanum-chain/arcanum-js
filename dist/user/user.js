"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockChainUser = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const constants_1 = require("../constants");
const convert_la_service_util_1 = require("../utils/convert.la.service.util");
const encode_service_util_1 = require("../utils/encode.service.util");
class BlockChainUser {
    constructor(users) {
        this.users = users;
        this.encodeService = new encode_service_util_1.EncodeUtilService();
        this.convertLaService = new convert_la_service_util_1.ConvertToLaService();
        if (this) {
            return this;
        }
    }
    createNewUser() {
        try {
            const { privateKey, publicKey } = this.generatePublicAndPrivateKey();
            const isOk = this.checkIsEmptyAddress(publicKey);
            const sedCode = this.generateSedCode(privateKey);
            const data = this.encryptUserSecretData(publicKey, {
                privateKey,
                sedCode,
            });
            if (isOk) {
                const newUser = {
                    publicKey,
                    balance: "100",
                    data: data,
                };
                const secrets = {
                    privateKey,
                    sedCode,
                };
                return { user: newUser, secrets };
            }
            else {
                throw new Error("Ошибка при создании пользователя");
            }
        }
        catch (e) {
            throw e;
        }
    }
    generateSedCode(privateKey) {
        try {
            const randomCode = node_crypto_1.default.randomBytes(50).toString("hex");
            const hash = node_crypto_1.default
                .createHash("md5")
                .update(`${randomCode}${privateKey}`)
                .digest("hex");
            const randomSubstringValStart = Math.ceil(Math.random() * 20);
            const randomSubstringValEnd = Math.ceil(Math.random() * 20);
            const sedCode = hash.substring(randomSubstringValStart, randomSubstringValEnd);
            if (sedCode.length <= 15) {
                return hash.substring(1, 10);
            }
            return sedCode;
        }
        catch (e) {
            throw e;
        }
    }
    checkIsEmptyAddress(publicKey) {
        try {
            const user = this.users[publicKey];
            if (user) {
                throw new Error("Такой юзер уже существует");
            }
            return true;
        }
        catch (e) {
            throw e;
        }
    }
    generatePublicAndPrivateKey() {
        try {
            let dirtyPublicKey = "";
            let dirtyPrivateKey = "";
            node_crypto_1.default.generateKeyPair("rsa", {
                modulusLength: 2048,
                publicKeyEncoding: {
                    type: "spki",
                    format: "pem",
                },
                privateKeyEncoding: {
                    type: "pkcs8",
                    format: "pem",
                },
            }, (err, pubKey, privKey) => {
                if (err && err instanceof Error) {
                    throw err;
                }
                dirtyPrivateKey = privKey;
                dirtyPublicKey = pubKey;
            });
            const dataPrivateKeyToHash = JSON.stringify({
                date: Date.now(),
                key: dirtyPrivateKey,
            });
            const dataPublicKeyToHash = JSON.stringify({
                date: Date.now() + Math.random(),
                key: dirtyPublicKey,
            });
            const newHashingPrivateKey = node_crypto_1.default
                .createHash("sha-256")
                .update(dataPrivateKeyToHash)
                .digest("hex");
            const newHashingPublicKey = node_crypto_1.default
                .createHash("sha-256")
                .update(dataPublicKeyToHash)
                .digest("hex");
            const keys = {
                publicKey: `${constants_1.DEFAULT_HASH_PREFIX}${newHashingPublicKey}`,
                privateKey: `${constants_1.DEFAULT_HASH_PREFIX}${newHashingPrivateKey}`,
            };
            dirtyPrivateKey = "";
            dirtyPublicKey = "";
            return keys;
        }
        catch (e) {
            throw e;
        }
    }
    getUserBalance(address) {
        try {
            const user = this.users[address];
            if (!user) {
                throw new Error("Not found user");
            }
            return +this.convertLaService.toRei(user.balance.toString());
        }
        catch (e) {
            throw e;
        }
    }
    encryptUserSecretData(publicKey, data) {
        try {
            const stepOneEncodeVal = this.encodeService.encodeUserSecret(data);
            const cipher = node_crypto_1.default.createCipheriv("aes-256-cbc", Buffer.from(publicKey.substring(4), "hex"), constants_1.CLASSIC_IV);
            cipher.setEncoding("hex");
            const encrypt = cipher.update(stepOneEncodeVal);
            const encrypted = Buffer.concat([encrypt, cipher.final()]);
            return `${constants_1.DEFAULT_HASH_PREFIX}${encrypted.toString("hex")}`;
        }
        catch (e) {
            throw e;
        }
    }
    getSecretUserData(publicKey, sedCode) {
        try {
            const userData = this.users[publicKey];
            if (!userData) {
                throw new Error("User not found");
            }
            return this.decodeUserData(publicKey, userData.data.substring(5), sedCode);
        }
        catch (e) {
            throw e;
        }
    }
    decodeUserData(publicKey, data, sedCode) {
        try {
            const decipher = node_crypto_1.default.createDecipheriv("aes-256-cbc", Buffer.from(publicKey.substring(4), "hex"), constants_1.CLASSIC_IV);
            const blockSize = 16;
            const decryptedParts = [];
            for (let i = 0; i < data.length; i += blockSize) {
                const block = data.substring(i, i + blockSize);
                const decryptedPart = decipher.update(block, "hex", "utf-8");
                decryptedParts.push(decryptedPart);
            }
            const finalDecrypted = decipher.final("utf-8");
            decryptedParts.push(finalDecrypted);
            const decryptedDataDirty = decryptedParts.join("");
            const value = this.encodeService.decodeUserSecret(decryptedDataDirty, sedCode);
            return value;
        }
        catch (e) {
            throw e;
        }
    }
}
exports.BlockChainUser = BlockChainUser;
//# sourceMappingURL=user.js.map
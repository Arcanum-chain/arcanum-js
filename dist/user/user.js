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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockChainUser = void 0;
const store_1 = require("../store");
const convert_la_service_util_1 = require("../utils/convert.la.service.util");
const keys_service_util_1 = require("../utils/keys.service.util");
class BlockChainUser {
    constructor(users) {
        this.users = users;
        this.store = store_1.BlockChainStore;
        this.convertLaService = new convert_la_service_util_1.ConvertToLaService();
        this.keyService = new keys_service_util_1.KeyService();
        if (this) {
            return this;
        }
    }
    createNewUser() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { privateKey, publicKey } = yield this.generatePublicAndPrivateKey();
                const isOk = this.checkIsEmptyAddress(publicKey);
                if (isOk) {
                    const newUser = {
                        publicKey,
                        balance: JSON.parse(process.env.IS_THE_TEST_NODE)
                            ? "100"
                            : "0",
                    };
                    this.store.setNewUser(newUser);
                    return { user: newUser, privateKey };
                }
                else {
                    throw new Error("Ошибка при создании пользователя");
                }
            }
            catch (e) {
                throw e;
            }
        });
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
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this.keyService.generateKeyPair();
            }
            catch (e) {
                throw e;
            }
        });
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
}
exports.BlockChainUser = BlockChainUser;
//# sourceMappingURL=user.js.map
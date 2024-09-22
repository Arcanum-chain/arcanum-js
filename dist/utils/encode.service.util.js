"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncodeUtilService = void 0;
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
}
exports.EncodeUtilService = EncodeUtilService;
//# sourceMappingURL=encode.service.util.js.map
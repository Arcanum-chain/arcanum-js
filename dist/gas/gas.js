"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockChainGas = void 0;
const constants_1 = require("../constants");
const convert_la_service_util_1 = require("../utils/convert.la.service.util");
class BlockChainGas {
    constructor(networkLoad) {
        this.networkLoad = networkLoad;
        this.basePrice = constants_1.GasBlockChain.BASE_GAS_PRICE;
        this.converterService = new convert_la_service_util_1.ConvertToLaService();
    }
    calculateGasPrice(amountType) {
        try {
            const priceMultiplier = 1 + this.networkLoad * 2;
            const calculatedGasPrice = this.basePrice * priceMultiplier;
            const minGasPrice = constants_1.GasBlockChain.MIN_GAS;
            const maxGasPrice = constants_1.GasBlockChain.MAX_GAS;
            const value = Math.max(minGasPrice, Math.min(calculatedGasPrice, maxGasPrice));
            if (amountType === constants_1.BASIC_CONVERT_VALUES_ENUM.LA) {
                return value;
            }
            else if (amountType === constants_1.BASIC_CONVERT_VALUES_ENUM.REI) {
                return +this.converterService.toRei(value.toString());
            }
            throw Error("Invalid convert currency type");
        }
        catch (e) {
            throw e;
        }
    }
}
exports.BlockChainGas = BlockChainGas;
//# sourceMappingURL=gas.js.map
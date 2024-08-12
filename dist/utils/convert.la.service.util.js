"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvertToLaService = void 0;
class ConvertToLaService {
    toLa(amount) {
        try {
            const parseAmount = this.checkIsNumberAmount(amount);
            const convertedAmount = parseAmount * 10 ** 10;
            return convertedAmount.toString();
        }
        catch (e) {
            throw e;
        }
    }
    toRei(amount) {
        try {
            const bigNumberAmount = this.checkIsNumberAmount(amount);
            const originalAmount = bigNumberAmount / 10 ** 10;
            return originalAmount.toString();
        }
        catch (e) {
            throw e;
        }
    }
    checkIsNumberAmount(amount) {
        try {
            const intAmount = Number(amount);
            if (isNaN(intAmount)) {
                throw new Error("Invalid amount type");
            }
            return Number(intAmount);
        }
        catch (e) {
            throw e;
        }
    }
}
exports.ConvertToLaService = ConvertToLaService;
//# sourceMappingURL=convert.la.service.util.js.map
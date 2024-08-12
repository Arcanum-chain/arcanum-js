import { BASIC_CONVERT_VALUES } from "../constants";
export declare class BlockChainGas {
    private readonly networkLoad;
    private readonly basePrice;
    private readonly converterService;
    constructor(networkLoad: number);
    calculateGasPrice(amountType: BASIC_CONVERT_VALUES): number;
}
//# sourceMappingURL=gas.d.ts.map
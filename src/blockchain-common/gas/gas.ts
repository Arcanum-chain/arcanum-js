import {
  BASIC_CONVERT_VALUES,
  BASIC_CONVERT_VALUES_ENUM,
  GasBlockChain,
} from "../../constants";

import { ConvertToLaService } from "../../utils";

export class BlockChainGas {
  private readonly basePrice: number;
  private readonly converterService: ConvertToLaService;

  constructor(private readonly networkLoad: number) {
    this.basePrice = GasBlockChain.BASE_GAS_PRICE;
    this.converterService = new ConvertToLaService();
  }

  public calculateGasPrice(amountType: BASIC_CONVERT_VALUES): number {
    try {
      const priceMultiplier = 1 + this.networkLoad * 2;
      const calculatedGasPrice = this.basePrice * priceMultiplier;

      const minGasPrice = GasBlockChain.MIN_GAS;
      const maxGasPrice = GasBlockChain.MAX_GAS;

      const value = Math.max(
        minGasPrice,
        Math.min(calculatedGasPrice, maxGasPrice)
      );

      if (amountType === BASIC_CONVERT_VALUES_ENUM.LA) {
        return value;
      } else if (amountType === BASIC_CONVERT_VALUES_ENUM.REI) {
        return +this.converterService.toArc(value.toString());
      }

      throw Error("Invalid convert currency type");
    } catch (e) {
      throw e;
    }
  }
}

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
      const priceMultiplier = 1 + this.networkLoad * 2; // Можем увеличить в 2 раза при максимальной нагрузке
      const calculatedGasPrice = this.basePrice * priceMultiplier;

      // Ограничение минимальной и максимальной цены газа
      const minGasPrice = GasBlockChain.MIN_GAS; // Минимальная цена газа в La
      const maxGasPrice = GasBlockChain.MAX_GAS; // Максимальная цена газа в La

      const value = Math.max(
        minGasPrice,
        Math.min(calculatedGasPrice, maxGasPrice)
      );

      if (amountType === BASIC_CONVERT_VALUES_ENUM.LA) {
        return value;
      } else if (amountType === BASIC_CONVERT_VALUES_ENUM.REI) {
        return +this.converterService.toRei(value.toString());
      }

      throw Error("Invalid convert currency type");
    } catch (e) {
      throw e;
    }
  }
}

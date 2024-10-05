export class ConvertToLaService {
  public toLa(amount: string): string {
    try {
      const parseAmount = this.checkIsNumberAmount(amount);

      const convertedAmount = parseAmount * 10 ** 10;

      return convertedAmount.toString();
    } catch (e) {
      throw e;
    }
  }

  public toArc(amount: string): string {
    try {
      const bigNumberAmount = this.checkIsNumberAmount(amount);

      const originalAmount = bigNumberAmount / 10 ** 10;

      return originalAmount.toString();
    } catch (e) {
      throw e;
    }
  }

  private checkIsNumberAmount(amount: string) {
    try {
      const intAmount = Number(amount);

      if (isNaN(intAmount)) {
        throw new Error("Invalid amount type");
      }

      return intAmount;
    } catch (e) {
      throw e;
    }
  }
}

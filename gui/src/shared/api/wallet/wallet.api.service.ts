import { apiInstance } from "../api.instance";

export class WalletApiService {
  private readonly api: typeof apiInstance = apiInstance;

  public async createWallet() {
    const { data } = await this.api.post("/user", {});

    return data;
  }
}

import { BlockChain } from "../../../../blockchain-common/chain/chain";

import { TransformError } from "../../errors";

export class UserService {
  private readonly blockchainApi: BlockChain;

  constructor() {
    this.blockchainApi = BlockChain.getInstance();
  }

  @TransformError()
  public async getUsers() {
    const data = await this.blockchainApi.getAllUsers();

    return data;
  }

  @TransformError()
  public async createUser() {
    const data = await this.blockchainApi.createNewUser();

    return data;
  }

  @TransformError()
  public async getUserByAddress(address: string) {
    const data = await this.blockchainApi.getUserByAddress(address);

    return data;
  }
}

import { BlockChain } from "../../../../chain/chain";

import { TransformError } from "../../errors";

export class BlockService {
  private readonly blockchainApi: BlockChain;

  constructor() {
    this.blockchainApi = BlockChain.getInstance();
  }

  @TransformError()
  public async getAllBlocks() {
    const data = await this.blockchainApi.getChain();

    return data;
  }

  @TransformError()
  public async getLatestBlock() {
    const data = await this.blockchainApi.getLatestBlock();

    return data;
  }

  @TransformError()
  public async getBlockByHash(hash: string) {
    const block = await this.blockchainApi.getBlockByHash(hash);

    return block;
  }
}

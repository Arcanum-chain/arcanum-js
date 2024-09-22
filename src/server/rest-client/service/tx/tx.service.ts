import { BlockChain } from "../../../../blockchain-common/chain/chain";

import { TransformError } from "../../errors";

import type { ICreateTxDto } from "../../dto";

export class TxService {
  private readonly blockchainApi: BlockChain;

  constructor() {
    this.blockchainApi = BlockChain.getInstance();
  }

  @TransformError()
  public async createTx(body: ICreateTxDto) {
    const data = await this.blockchainApi.createTransaction(body);

    return data;
  }

  @TransformError()
  public async getTxByHashInMempool(hash: string) {
    const data = await this.blockchainApi.getTxByHash(hash);

    return data;
  }

  @TransformError()
  public async getAllTxsInMempool() {
    const data = await this.blockchainApi.getTxs();

    return data;
  }
}

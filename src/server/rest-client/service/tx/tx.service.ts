import { BlockChain } from "../../../../chain/chain";

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
}

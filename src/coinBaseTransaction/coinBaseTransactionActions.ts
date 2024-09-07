import { BlockChainStore } from "../store";

import { ConvertToLaService } from "../utils/convert.la.service.util";

import { BlockChainError, BlockChainErrorCodes } from "../errors";

import type { CoinBaseTx } from "./interface/coinbase.interface";

export class CoinBaseTxActions {
  private readonly store: typeof BlockChainStore = BlockChainStore;
  private readonly convertService: ConvertToLaService;

  constructor(private coinBaseTx: CoinBaseTx) {
    this.convertService = new ConvertToLaService();
  }

  public setDistributing() {
    try {
      this.coinBaseTx.isDistributed = true;
      this.transferCoinBase();
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_ROLLBACK_CB_TX);
    }
  }

  private transferCoinBase(): boolean {
    try {
      const miner = this.store.getUserByAddress(this.coinBaseTx.minerAddress);

      const oldMinerBalanceToLa = +this.convertService.toLa(miner.balance);
      const newMinerBalance = this.convertService.toRei(
        String(
          oldMinerBalanceToLa +
            +this.convertService.toLa(String(this.coinBaseTx.totalRewardRei))
        )
      );

      this.store.updateUserBalance(miner.publicKey, newMinerBalance);

      return true;
    } catch (e) {
      console.log(e);
      throw new BlockChainError(BlockChainErrorCodes.FAIL_COINBASE_TX);
    }
  }

  public rollbackTx(): boolean {
    try {
      if (this.coinBaseTx.isDistributed) {
        const miner = this.store.getUserByAddress(this.coinBaseTx.minerAddress);

        const rollbackBalance = this.convertService.toRei(
          String(
            +this.convertService.toLa(miner.balance) -
              +this.convertService.toLa(this.coinBaseTx.totalRewardRei)
          )
        );

        this.store.updateUserBalance(miner.publicKey, rollbackBalance);

        return true;
      }

      return false;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_ROLLBACK_CB_TX);
    }
  }
}

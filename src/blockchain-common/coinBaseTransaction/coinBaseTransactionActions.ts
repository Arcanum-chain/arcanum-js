import { BlockChainStore } from "../../store";

import { ConvertToLaService } from "../../utils";

import { BlockChainError, BlockChainErrorCodes } from "../../errors";

import type { CoinBaseTx } from "./interface/coinbase.interface";

export class CoinBaseTxActions {
  private readonly store: typeof BlockChainStore = BlockChainStore;
  private readonly convertService: ConvertToLaService;

  constructor(private coinBaseTx: CoinBaseTx) {
    this.convertService = new ConvertToLaService();
  }

  public async setDistributing() {
    try {
      this.coinBaseTx.isDistributed = true;
      await this.transferCoinBase();
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_ROLLBACK_CB_TX);
    }
  }

  private async transferCoinBase(): Promise<boolean> {
    try {
      const miner = await this.store.getUserByAddress(
        this.coinBaseTx.minerAddress
      );

      const oldMinerBalanceToLa = +this.convertService.toLa(miner.balance);
      const newMinerBalance = this.convertService.toArc(
        String(
          oldMinerBalanceToLa +
            +this.convertService.toLa(String(this.coinBaseTx.totalRewardRei))
        )
      );

      await this.store.updateUserBalance(miner.address, newMinerBalance);

      return true;
    } catch (e) {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_COINBASE_TX);
    }
  }

  public async rollbackTx(): Promise<boolean> {
    try {
      if (this.coinBaseTx.isDistributed) {
        const miner = await this.store.getUserByAddress(
          this.coinBaseTx.minerAddress
        );

        const rollbackBalance = this.convertService.toArc(
          String(
            +this.convertService.toLa(miner.balance) -
              +this.convertService.toLa(this.coinBaseTx.totalRewardRei)
          )
        );

        await this.store.updateUserBalance(miner.publicKey, rollbackBalance);

        return true;
      }

      return false;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_ROLLBACK_CB_TX);
    }
  }
}

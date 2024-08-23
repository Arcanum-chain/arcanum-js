import EventEmitter from "events";
import { promisify } from "util";

import { BlockChainError, BlockChainErrorCodes } from "../errors";

import { CoinBaseTxActions } from "../coinBaseTransaction/coinBaseTransactionActions";
import { BlockChainStore, PeersStore } from "../store";
import { TransactionActions } from "../transaction/transactionActions";

import { EventMessage } from "../constants/events.messages";
import { BlockChainMessage, Cron, MessageEvent } from "../utils";

import type { IBlock } from "@/block/block.interface";
import type { CoinBaseTx } from "@/coinBaseTransaction/interface/coinbase.interface";
import type { Transaction } from "@/transaction/transaction.interface";

class BlockConfirmationService extends EventEmitter {
  private confirmedBlocks: Record<
    IBlock["hash"],
    { timestamp: number; count: number }
  > = {};
  private readonly peersStore: typeof PeersStore = PeersStore;
  private readonly txActions: TransactionActions;
  private readonly store: typeof BlockChainStore = BlockChainStore;

  constructor() {
    super();

    this.txActions = new TransactionActions();
    this.subscribe();
  }

  @BlockChainMessage(EventMessage.BLOCK_ADDED)
  private addNewCreatedBlock(msg?: MessageEvent<IBlock>): void {
    const block = msg?.msg;

    if (!block) return;

    const isEmpty = this.confirmedBlocks[block.hash];

    if (isEmpty) {
      throw new BlockChainError(BlockChainErrorCodes.DUPLICATE_DATA);
    }

    this.confirmedBlocks[block.hash] = {
      count: 0,
      timestamp: block.timestamp,
    };
    this.emit(EventMessage.NEW_PENDING_BLOCK, block);
  }

  private verifyBlock() {
    try {
      const latestTenBlocks = this.store.getChain().slice(-10);

      latestTenBlocks.forEach((block) => {
        if (this.store.getChain()[block.index + 6] && !block.verify) {
          this.emit(EventMessage.CONFIRMED_VERIFY_BLOCK, block.hash);
          this.store.setVerifyBlockByHash(block.hash);
          this.transferCoinBaseTx(block.data.coinBase as CoinBaseTx);
          this.transfer(Object.values(block.data.transactions));
        }
      });
    } catch (e) {
      throw new BlockChainError(BlockChainErrorCodes.INVALID_CONSENSUS_STATUS);
    }
  }

  private howToPeersVerifyBlock(hash: string): number {
    const allVerCountBlock: number = this.confirmedBlocks[hash].count; // 100
    const peersLength: number = this.peersStore.getActiveNodes().length; // 1000

    if (peersLength === 0) {
      return 0;
    }

    const percentage = +((allVerCountBlock / peersLength) * 100).toFixed(2);

    if (percentage >= 51) {
      this.verifyBlock();

      delete this.confirmedBlocks[hash];
    }

    return percentage;
  }

  public confirmBlock(blockHash: string) {
    const currentConfirmations = this.confirmedBlocks[blockHash];
    if (currentConfirmations) {
      this.confirmedBlocks[blockHash].count += 1;

      this.howToPeersVerifyBlock(blockHash);

      // Проверяем, подтвердилось ли 6 блоков после блока
      //   if (currentConfirmations + 1 >= 6) {
      //     const block = this.findBlockByHash(blockHash);
      //     if (block) {
      //       this.emit('blockConfirmedWith6Confirmations', block);
      //     }
      //   }
    }
  }

  private async transfer(txs: Transaction[]) {
    const transferAsync = promisify(this.txActions.transfer);

    await Promise.all(txs.map(async (tx) => await transferAsync(tx)));
  }

  private transferCoinBaseTx(tx: CoinBaseTx): void {
    const service = new CoinBaseTxActions(tx);
    service.setDistributing();
    service.transferCoinBase();
  }

  private subscribe() {
    this.addNewCreatedBlock();
    this.autoDeleteUnVerifyBlocks();
    this.verifyBlock();
  }

  @Cron("0 */15 * * * *")
  private autoDeleteUnVerifyBlocks() {
    try {
      const blocks = this.confirmedBlocks;

      Object.entries(blocks).forEach(([hash, block]) => {
        const currentTime = Date.now();
        const twentyMinutesAgo = currentTime - 20 * 60 * 1000;

        if (block.timestamp < twentyMinutesAgo) {
          delete this.confirmedBlocks[hash];
        }
      });
    } catch (e) {
      console.log(e);
    }
  }
}

export default new BlockConfirmationService();

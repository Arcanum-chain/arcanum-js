import EventEmitter from "events";

import { BlockChainError, BlockChainErrorCodes } from "../../errors";

import { CoinBaseTxActions } from "../coinBaseTransaction/coinBaseTransactionActions";
import { DumpingService } from "../../dumping/dumping";
import { BlockChainStore, PeersStore } from "../../store";

import { BlockLimits } from "../../constants";
import { EventMessage } from "../../constants/events.messages";
import { BlockChainMessage, Cron, MessageEvent } from "../../utils";
import { TransactionActions } from "../index";

import type { CoinBaseTx, IBlock, Transaction } from "../index";

class BlockConfirmationService extends EventEmitter {
  private confirmedBlocks: Record<
    IBlock["hash"],
    { timestamp: number; count: number }
  > = {};
  private readonly peersStore: typeof PeersStore = PeersStore;
  private readonly txActions: TransactionActions;
  private readonly store: typeof BlockChainStore = BlockChainStore;
  private readonly dumpingService: DumpingService;

  constructor() {
    super();

    this.txActions = new TransactionActions();
    this.dumpingService = new DumpingService();
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

  private async verifyBlock() {
    try {
      const chain = await this.store.getChain();
      const latestTenBlocks = chain.slice(-10);

      await Promise.all(
        latestTenBlocks.map(async (block) => {
          if (
            chain[block.index + BlockLimits.DEFAULT_BLOCK_CONFIRMATIONS] &&
            !block.verify &&
            block.index !== 0
          ) {
            this.emit(EventMessage.CONFIRMED_VERIFY_BLOCK, block.hash);
            this.store.setVerifyBlockByHash(block.hash);
            await this.transferCoinBaseTx(block.data.coinBase as CoinBaseTx);
            this.transfer(Object.values(block.data.transactions));
            // this.dumpingService.dumpingNewBlock(block);
          }
        })
      );
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.INVALID_CONSENSUS_STATUS);
    }
  }

  private async howToPeersVerifyBlock(hash: string): Promise<number> {
    const allVerCountBlock: number = this.confirmedBlocks[hash].count; // 100
    const peersLength: number = (await this.peersStore.getActiveNodes()).length; // 1000

    if (peersLength === (1 || 0)) {
      this.store.setNewBlockToChain(hash);
      this.verifyBlock();

      delete this.confirmedBlocks[hash];

      return 0;
    }

    const percentage = +((allVerCountBlock / peersLength) * 100).toFixed(2);

    if (percentage >= 51 || (percentage >= 50 && peersLength === 2)) {
      this.store.setNewBlockToChain(hash);
      this.verifyBlock();

      delete this.confirmedBlocks[hash];
    }

    return percentage;
  }

  public async confirmBlock(blockHash: string) {
    const currentConfirmations = this.confirmedBlocks[blockHash];
    if (currentConfirmations) {
      this.confirmedBlocks[blockHash].count += 1;

      await this.howToPeersVerifyBlock(blockHash);
    }
  }

  private async transfer(txs: Transaction[]) {
    try {
      await Promise.all(
        txs.map(async (tx) => await this.txActions.transfer(tx))
      );
    } catch (e) {
      console.log(e);
    }
  }

  private async transferCoinBaseTx(tx: CoinBaseTx): Promise<void> {
    const service = new CoinBaseTxActions(tx);
    await service.setDistributing();
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

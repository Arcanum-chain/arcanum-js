import { Block } from "../block/block";
import { CoinBaseTransaction } from "../coinBaseTransaction/coinBaseTransaction";
import { BlockLimits, DEFAULT_HASH_PREFIX } from "../../constants";
import { MemPool } from "../memPool/memPool";
import { BlockChainStore, MetadataBlockchainStore } from "../../store";
import { TransactionActions } from "../transaction/transactionActions";
import { MerkleTree, VerifyBlockService, BytesSize } from "../../utils";
import { Logger } from "../../logger";

export class MiningBlock {
  private verifyBlockService: VerifyBlockService;
  public powPrefix: string = BlockLimits.DEFAULT_HASH_PREFIX;
  private readonly metadataStore: typeof MetadataBlockchainStore =
    MetadataBlockchainStore;
  private readonly store: typeof BlockChainStore = BlockChainStore;
  private readonly memPool: MemPool;
  private readonly txActions: TransactionActions;
  private readonly logger = new Logger();
  private readonly bytesSize: BytesSize;

  constructor(public readonly minerAddress: string) {
    this.verifyBlockService = new VerifyBlockService();
    this.memPool = MemPool.getInstance();
    this.txActions = new TransactionActions();
    this.bytesSize = new BytesSize();
  }

  public async mineBlock(block: Block) {
    try {
      let nonce = 0;
      const difficulty = await this.calculateDifficulty();

      while (true) {
        const blockHash = block.calculateHash();
        const proofingHash = this.verifyBlockService.genHash(blockHash + nonce);

        if (
          this.verifyBlockService.isHashProofed({
            hash: proofingHash,
            difficulty: difficulty,
            prefix: this.powPrefix,
          }) &&
          this.store.getPendingBlocks().length === 0
        ) {
          const chain = (await this.store.getChain()).reverse();

          block.hash = `${DEFAULT_HASH_PREFIX}${proofingHash}`;
          block.data.blockHash = `${DEFAULT_HASH_PREFIX}${proofingHash}`;
          block.index = chain[chain.length - 1]?.index + 1;
          block.nonce = nonce;
          block.prevBlockHash = chain[chain.length - 1].hash;

          this.logger.info(`MINING Valid hash found ${proofingHash}`);

          return await this.appendCoinBaseTx(block);
        }

        nonce++;
      }
    } catch (e) {
      throw e;
    }
  }

  private async calculateTxsMerkleRoot() {
    try {
      const txs = await this.memPool.getPendingTxsToMineBlock();

      const root = new MerkleTree(txs).getRootHash;

      return { rootHash: root, transactions: txs };
    } catch (e) {
      throw e;
    }
  }

  private async appendTxsToBlock(block: Block) {
    try {
      if (block.index !== 0) {
        const { rootHash, transactions } = await this.calculateTxsMerkleRoot();
        block.data.txMerkleRoot = rootHash;
        let totalFeeRei = 0;

        this.logger.info(
          `MINING appending txs to block(${block.index}), txs count: ${transactions.length}`
        );

        transactions.forEach((tx) => {
          tx.hash = `${block.index}::${tx.hash}`;
          block.data.transactions[tx.hash] = tx;
          tx.blockHash = block.hash;
          totalFeeRei += tx.fee;
        });

        block.totalFeeRei = totalFeeRei;

        await this.memPool.deletePendingTxPollToConfirmMineBlock();
      }
    } catch (e) {
      throw e;
    }
  }

  private async appendCoinBaseTx(block: Block) {
    try {
      const tx = new CoinBaseTransaction({
        blockHash: block.hash,
        timestamp: Date.now(),
        minerAddress: this.minerAddress,
      });

      block.data.coinBase = await tx.createCoinBaseTx();

      await this.appendTxsToBlock(block);

      const blockSize = this.bytesSize.calculate(block);
      block.size = blockSize;

      return block.generateNewBlock();
    } catch (e) {
      throw e;
    }
  }

  public async calculateDifficulty() {
    try {
      const chain = await this.store.getChain();
      const lastBlockTimestamp =
        chain[chain.length - 1]?.timestamp ?? Date.now();
      const currentTimestamp = Date.now();
      const timeTaken = currentTimestamp - lastBlockTimestamp;

      if (timeTaken < BlockLimits.MAX_MINING_TIME / 2) {
        await this.metadataStore.setDifficulty(1, "+");
      } else if (timeTaken > BlockLimits.MAX_MINING_TIME * 2) {
        await this.metadataStore.setDifficulty(1, "-");
      }

      return this.metadataStore.getDifficulty;
    } catch (e) {
      throw e;
    }
  }
}

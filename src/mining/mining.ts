import { Block } from "../block/block";
import { CoinBaseTransaction } from "../coinBaseTransaction/coinBaseTransaction";
import { BlockLimits, DEFAULT_HASH_PREFIX } from "../constants";
import { MemPool } from "../memPool/memPool";
import { BlockChainStore, MetadataBlockchainStore } from "../store";
import { TransactionActions } from "../transaction/transactionActions";
import { MerkleTree, VerifyBlockService } from "../utils";

export class MiningBlock {
  private verifyBlockService: VerifyBlockService;
  public powPrefix: string = BlockLimits.DEFAULT_HASH_PREFIX;
  private readonly metadataStore: typeof MetadataBlockchainStore =
    MetadataBlockchainStore;
  private readonly store: typeof BlockChainStore = BlockChainStore;
  private readonly memPool: MemPool;
  private readonly txActions: TransactionActions;
  private readonly merkleTreeService: MerkleTree;

  constructor(public readonly minerAddress: string) {
    this.verifyBlockService = new VerifyBlockService();
    this.memPool = MemPool.getInstance();
    this.txActions = new TransactionActions();
    this.merkleTreeService = new MerkleTree();
  }

  public mineBlock(block: Block) {
    try {
      let nonce = 0;
      this.calculateDifficulty();

      while (true) {
        const blockHash = block.calculateHash();
        const proofingHash = this.verifyBlockService.genHash(blockHash + nonce);

        if (
          this.verifyBlockService.isHashProofed({
            hash: proofingHash,
            difficulty: this.metadataStore.getDifficulty,
            prefix: this.powPrefix,
          }) &&
          this.store.getPendingBlocks().length === 0
        ) {
          block.hash = `${DEFAULT_HASH_PREFIX}${proofingHash}`;
          block.data.blockHash = `${DEFAULT_HASH_PREFIX}${proofingHash}`;
          block.index =
            this.store.getChain()[this.store.getChain().length - 1].index + 1;

          return this.appendCoinBaseTx(block);
        }

        nonce++;
      }
    } catch (e) {
      throw e;
    }
  }

  private calculateTxsMerkleRoot() {
    try {
      const txs = this.memPool.getPendingTxsToMineBlock();

      const { root } = this.merkleTreeService.buildTxsMerkleTree(txs);

      return { rootHash: root, transactions: txs };
    } catch (e) {
      throw e;
    }
  }

  private appendTxsToBlock(block: Block) {
    try {
      if (block.index !== 0) {
        const { rootHash, transactions } = this.calculateTxsMerkleRoot();
        block.data.txMerkleRoot = rootHash;
        let totalFeeRei = 0;

        transactions.forEach((tx) => {
          block.data.transactions[tx.hash] = tx;
          totalFeeRei += tx.fee;
        });

        block.totalFeeRei = totalFeeRei;

        this.memPool.deletePendingTxPollToConfirmMineBlock();
      }
    } catch (e) {
      throw e;
    }
  }

  private appendCoinBaseTx(block: Block) {
    try {
      const tx = new CoinBaseTransaction({
        blockHash: block.hash,
        timestamp: Date.now(),
        minerAddress: this.minerAddress,
      });

      block.data.coinBase = tx.createCoinBaseTx();

      this.appendTxsToBlock(block);

      return block;
    } catch (e) {
      throw e;
    }
  }

  public calculateDifficulty() {
    try {
      const lastBlockTimestamp =
        this.store.getChain()[this.store.getChain().length - 1]?.timestamp ??
        Date.now();
      const currentTimestamp = Date.now();
      const timeTaken = currentTimestamp - lastBlockTimestamp;

      if (timeTaken < BlockLimits.MAX_MINING_TIME / 2) {
        this.metadataStore.difficulty += 1;
      } else if (timeTaken > BlockLimits.MAX_MINING_TIME * 2) {
        this.metadataStore.difficulty -= 1;
      }

      return this.metadataStore.getDifficulty;
    } catch (e) {
      throw e;
    }
  }
}

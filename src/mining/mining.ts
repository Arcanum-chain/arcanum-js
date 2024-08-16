import { Block } from "../block/block";
import { BlockLimits, DEFAULT_HASH_PREFIX } from "../constants";
import { BlockChainStore, MetadataBlockchainStore } from "../store";
import { VerifyBlockService } from "../utils/verify.block.util.service";

export class MiningBlock {
  private verifyBlockService: VerifyBlockService;
  public powPrefix: string = BlockLimits.DEFAULT_HASH_PREFIX;
  private readonly metadataStore: typeof MetadataBlockchainStore =
    MetadataBlockchainStore;
  private readonly store: typeof BlockChainStore = BlockChainStore;

  constructor() {
    this.verifyBlockService = new VerifyBlockService();
  }

  public mineBlock(block: Block) {
    try {
      let nonce = 0;
      this.calculateDifficulty();

      console.log("Block to mine:", block);

      while (true) {
        const blockHash = block.calculateHash();
        const proofingHash = this.verifyBlockService.genHash(blockHash + nonce);

        if (
          this.verifyBlockService.isHashProofed({
            hash: proofingHash,
            difficulty: this.metadataStore.getDifficulty,
            prefix: this.powPrefix,
          })
        ) {
          block.hash = `${DEFAULT_HASH_PREFIX}${proofingHash}`;
          block.data.blockHash = `${DEFAULT_HASH_PREFIX}${proofingHash}`;
          block.index =
            this.store.getChain()[this.store.getChain().length - 1].index + 1;

          return block;
        }

        nonce++;
      }
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

      // 2. Регулировка сложности
      if (timeTaken < BlockLimits.MAX_MINING_TIME / 2) {
        // Если блок был найден слишком быстро, увеличиваем сложность
        this.metadataStore.difficulty += 1;
      } else if (timeTaken > BlockLimits.MAX_MINING_TIME * 2) {
        // Если блок был найден слишком медленно, уменьшаем сложность
        this.metadataStore.difficulty -= 1;
      }

      return this.metadataStore.getDifficulty;
    } catch (e) {
      throw e;
    }
  }
}

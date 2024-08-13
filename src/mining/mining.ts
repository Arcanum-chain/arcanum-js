import { Block } from "../block/block";
import { BlockLimits, DEFAULT_HASH_PREFIX } from "../constants";
import { VerifyBlockService } from "../utils/verify.block.util.service";

export class MiningBlock {
  private verifyBlockService: VerifyBlockService;
  public difficulty: number = BlockLimits.MIN_DIFFICULTY;
  public powPrefix: string = BlockLimits.DEFAULT_HASH_PREFIX;

  constructor(private chain: Block[]) {
    this.verifyBlockService = new VerifyBlockService();
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
            difficulty: this.difficulty,
            prefix: this.powPrefix,
          })
        ) {
          block.hash = `${DEFAULT_HASH_PREFIX}${proofingHash}`;
          block.data.blockHash = `${DEFAULT_HASH_PREFIX}${proofingHash}`;

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
      const lastBlockTimestamp = this.chain[this.chain.length - 1].timestamp;
      const currentTimestamp = Date.now();
      const timeTaken = currentTimestamp - lastBlockTimestamp;

      // 2. Регулировка сложности
      if (timeTaken < BlockLimits.MAX_MINING_TIME / 2) {
        // Если блок был найден слишком быстро, увеличиваем сложность
        this.difficulty += 1;
      } else if (timeTaken > BlockLimits.MAX_MINING_TIME * 2) {
        // Если блок был найден слишком медленно, уменьшаем сложность
        this.difficulty -= 1;
      }

      return this.difficulty;
    } catch (e) {
      throw e;
    }
  }
}

import { BlockChainStore, MetadataBlockchainStore } from "../store";
import { VerifyBlockService } from "../utils";
import { ConvertToLaService } from "../utils/convert.la.service.util";

import { DEFAULT_HASH_PREFIX } from "../constants";
import { BlockChainError, BlockChainErrorCodes } from "../errors";

import type { CoinBaseTx } from "./interface/coinbase.interface";
import type { CoinBaseProps } from "./interface/props.interface";

export class CoinBaseTransaction {
  private readonly store: typeof BlockChainStore = BlockChainStore;
  private readonly metaStore: typeof MetadataBlockchainStore =
    MetadataBlockchainStore;
  private readonly convertService: ConvertToLaService;
  public reward: number;
  public blockHash: string;
  private timestamp: number;
  private minerAddress: string;
  private readonly genHashService: VerifyBlockService;
  private readonly hash: string;
  public isDistributed: boolean = false;

  constructor({ blockHash, timestamp, minerAddress }: CoinBaseProps) {
    this.convertService = new ConvertToLaService();
    this.reward = +this.gerReward();
    this.blockHash = blockHash;
    this.timestamp = timestamp;
    this.minerAddress = minerAddress;
    this.genHashService = new VerifyBlockService();
    this.hash = this.createHash();
    this.validate();
  }

  public createCoinBaseTx() {
    try {
      const tx: CoinBaseTx = {
        hash: this.hash,
        blockHash: this.blockHash,
        totalRewardRei: String(this.reward),
        timestamp: Date.now(),
        minerAddress: this.minerAddress,
        isDistributed: false,
      };

      return tx;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_COINBASE_TX);
    }
  }

  private gerReward() {
    try {
      const chainLength = this.store.getChain().length;
      const reward = this.metaStore.getBlockReward(chainLength);

      return this.convertService.toRei(`${reward}`);
    } catch (e) {
      console.log(e);
      throw new BlockChainError(BlockChainErrorCodes.FAIL_COINBASE_TX);
    }
  }

  private createHash() {
    try {
      const payload = JSON.stringify({
        blockHash: this.blockHash,
        timestamp: this.timestamp,
        minerAddress: this.minerAddress,
        reward: this.reward,
      });

      const hash = `${DEFAULT_HASH_PREFIX}${this.genHashService.genHash(
        payload
      )}`;

      this.genHashService.isHashValid(hash);

      return hash;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_COINBASE_TX);
    }
  }

  private validate(): boolean {
    try {
      const miner = this.store.getUserByPublicKey(this.minerAddress);

      if (!miner) throw new Error();

      this.genHashService.isHashValid(this.blockHash);
      const isProofed = this.genHashService.isHashProofed({
        hash: this.blockHash.substring(DEFAULT_HASH_PREFIX.length),
        difficulty: this.metaStore.getDifficulty,
      });

      if (!isProofed) {
        throw new Error();
      }

      return true;
    } catch (e) {
      console.log(e);
      throw new BlockChainError(BlockChainErrorCodes.BAD_DATA);
    }
  }
}

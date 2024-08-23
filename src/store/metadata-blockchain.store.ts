import EventEmitter from "events";

import { BlockLimits } from "../constants";
import { BlockChainError, BlockChainErrorCodes } from "../errors";

import type { MetadataBlockchain } from "@/basic/interface/metadata.blockchain";
import type { IBlock } from "../block/block.interface";

class MetadataBlockChainStore extends EventEmitter {
  public difficulty: number = BlockLimits.MIN_DIFFICULTY;
  private lastVerifyBlockInChain: IBlock | undefined;
  public blockReward: number = BlockLimits.START_BLOCK_MINING_REWARD;
  public totalSupply: number = 0;

  public get getDifficulty(): number {
    try {
      return this.difficulty;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.ERROR_IN_METADATA_STORE);
    }
  }

  public get getLastVerifyBlockInChain() {
    try {
      return this.lastVerifyBlockInChain;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.ERROR_IN_METADATA_STORE);
    }
  }

  public set setLastVerifyBlockInChain(block: IBlock) {
    try {
      this.lastVerifyBlockInChain = block;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.ERROR_IN_METADATA_STORE);
    }
  }

  public getBlockReward(chainLength: number): number {
    try {
      const halvingCount = Math.floor(chainLength / 210000);
      this.blockReward /= Math.pow(2, halvingCount);

      return this.blockReward;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public synchronizeMetadata(meta: MetadataBlockchain) {
    try {
      (this.difficulty = meta.difficulty),
        (this.blockReward = meta.blockReward);
      this.lastVerifyBlockInChain = meta.lastVerifyBlock;
    } catch {
      throw new BlockChainError(
        BlockChainErrorCodes.FAIL_SYNCHRONIZE_CHAIN_METADATA
      );
    }
  }
}

export default new MetadataBlockChainStore();

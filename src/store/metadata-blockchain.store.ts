import EventEmitter from "events";

import { Block } from "../block/block";
import { BlockLimits } from "../constants";
import { BlockChainError, BlockChainErrorCodes } from "../errors";

class MetadataBlockChainStore extends EventEmitter {
  private difficulty: number = BlockLimits.MIN_DIFFICULTY;
  private lastVerifyBlockInChain: Block | undefined;

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

  public set setLastVerifyBlockInChain(block: Block) {
    try {
      this.lastVerifyBlockInChain = block;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.ERROR_IN_METADATA_STORE);
    }
  }
}

export default new MetadataBlockChainStore();

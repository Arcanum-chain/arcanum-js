import { BlockChainError, BlockChainErrorCodes } from "../errors";
import { BlockChainStore, MetadataBlockchainStore } from "../store";
import { VerifyBlockService } from "../utils";

import type { IBlock } from "../block/block.interface";

export class SecurityAssistent {
  private readonly store: typeof BlockChainStore = BlockChainStore;
  private readonly metaStore: typeof MetadataBlockchainStore =
    MetadataBlockchainStore;
  private readonly verifyBlockService: VerifyBlockService;

  constructor() {
    this.verifyBlockService = new VerifyBlockService();
  }

  public verifyNewBlock(block: IBlock): boolean {
    try {
      this.verifyBlockService.isHashValid(block.hash);
      this.verifyBlockService.isHashProofed({
        hash: block.hash,
        difficulty: this.metaStore.getDifficulty,
      });
      this.verifyChainConsensusBy40Blocks(block);

      return true;
    } catch (e) {
      throw e;
    }
  }

  private verifyChainConsensusBy40Blocks(newBlock: IBlock) {
    try {
      const chain = this.store.getChain();
      chain.push(newBlock);
      const isVerify40Blocks = this.chainInLast40VerifyBlocks(chain);

      if (!isVerify40Blocks) {
        throw new BlockChainError(
          BlockChainErrorCodes.INVALID_CONSENSUS_STATUS
        );
      }

      return true;
    } catch (e) {
      throw e;
    }
  }

  private chainInLast40VerifyBlocks(chain: IBlock[]) {
    try {
      const isGenesisBlock = this.isGenesisBlock(
        chain[chain.length - 1],
        chain
      );
      const length = chain.length >= 41 ? chain.length - 40 : chain.length;

      if (isGenesisBlock) {
        return true;
      }

      // for (let i = chain.length - 1; i > length; i--) {
      //   const currentBlock = chain[i];
      //   const previousBlock = chain[i - 1];

      //   console.log(i, i - 1);

      //   if (currentBlock.prevBlockHash !== previousBlock.hash) {
      //     return false;
      //   }
      // }

      for (let i = 1; i < chain.length; i++) {
        const currentBlock = chain[i];
        const previousBlock = chain[i - 1];

        if (currentBlock.prevBlockHash !== previousBlock.hash) {
          return false;
        }
      }

      return true;
    } catch (e) {
      throw e;
    }
  }

  private isGenesisBlock(newBlock: IBlock, chain: IBlock[]) {
    try {
      if (chain.length === 0 && newBlock.index === 0) {
        return true;
      }

      return false;
    } catch (e) {
      throw e;
    }
  }
}

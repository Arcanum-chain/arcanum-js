import type { IBlock } from "@/block/block.interface";

export interface MetadataBlockchain {
  difficulty: number;
  blockReward: number;
  lastVerifyBlock: IBlock;
}

import type { IBlock } from "../blockchain-common";

export interface MetaChain {
  difficulty: number;
  lastVerifyBlockInChain?: IBlock;
  blockReward: number;
  totalSupply: number;
}

export enum MetaFields {
  DIFFICULTY = "difficulty",
  LAST_VERIFY_BLOCK_IN_CHAIN = "lastVerifyBlockInChain",
  BLOCK_REWARD = "blockReward",
  TOTAL_SUPPLY = "totalSupply",
}

export interface TechMeta {
  readonly hasAlreadyGenesisBlock: boolean;
}

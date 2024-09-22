import type { IBlock } from "../../blockchain-common";

export interface MetadataBlockchain {
  difficulty: number;
  blockReward: number;
  lastVerifyBlock: IBlock;
}

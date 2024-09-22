import type { IBlockData } from "../index";

export interface BlockConstructor {
  readonly index: number;
  readonly timestamp: number;
  readonly data: Omit<IBlockData, "blockHash">;
  prevBlockHash: string;
}

export interface IBlock {
  index: number;
  readonly timestamp: number;
  prevBlockHash: string;
  hash: string;
  readonly data: IBlockData;
  verify: boolean;
  readonly totalFeeRei?: number;
  nonce: number;
}

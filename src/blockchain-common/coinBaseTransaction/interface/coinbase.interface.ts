export interface CoinBaseTx {
  readonly hash: string;
  blockHash: string;
  readonly totalRewardRei: string;
  readonly timestamp: number;
  readonly minerAddress: string;
  isDistributed: boolean;
}

import type { CoinBaseTx, Transaction } from "../index";

export interface IBlockData {
  transactions: Record<string, Transaction>;
  blockHash: string;
  coinBase?: CoinBaseTx; // coinbase транзакции нет только в genesis блоке
  txMerkleRoot?: string;
}

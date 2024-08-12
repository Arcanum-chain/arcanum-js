import type { Transaction } from "../transaction/transaction.interface";

export interface IBlockData {
  transactions: Record<string, Transaction>;
  readonly blockHash: string;
}

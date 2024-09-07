import type { User } from "../user/user.interface";

export interface Transaction {
  data: {
    sender: string;
    amount: number;
    to: string;
    timestamp: number;
  };
  blockHash: string;
  hash: string;
  readonly fee: number;
}

export interface TransactionDecoded {
  readonly data: {
    readonly sender: string;
    readonly to: string;
    readonly amount: string;
    readonly indexBlock: string;
    readonly timestamp: string;
    blockHash: string;
  };
  readonly blockHash: string;
  readonly hash: string;
}

export interface BlockTransactionConstructor {
  readonly sender: string;
  readonly to: string;
  readonly amount: number;
  readonly indexBlock: number;
  readonly blockHash: string;
  readonly timestamp: number;
  readonly users: Record<string, User>;
  readonly signature: string;
}

import type { CoinBaseTx } from "../coinBaseTransaction/interface/coinbase.interface";
import type { Transaction } from "../transaction/transaction.interface";
export interface IBlockData {
    transactions: Record<string, Transaction>;
    blockHash: string;
    coinBase?: CoinBaseTx;
    txMerkleRoot?: string;
}
//# sourceMappingURL=blockData.interface.d.ts.map
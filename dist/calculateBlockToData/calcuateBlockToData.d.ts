import { BlockTransaction } from "../transaction/transaction";
import type { CalculateBlockToDataConstructor } from "./calculateBlockToData.interface";
export declare class CalculateBlockToData {
    private readonly blockChain;
    lastBlockToFullTransactionsIndex: number;
    mimePullTransactions: Record<string, BlockTransaction>;
    constructor({ blockChain }: CalculateBlockToDataConstructor);
    private calculateBlockToTransaction;
    mutateBlockToAddTransaction(transaction: BlockTransaction): false | import("../transaction/transaction.interface").Transaction;
    emitNewTransactionToPull(): void;
}
//# sourceMappingURL=calcuateBlockToData.d.ts.map
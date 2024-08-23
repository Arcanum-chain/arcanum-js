import { BlockChainGas } from "../gas/gas";
import { ConvertToLaService } from "../utils/convert.la.service.util";
import { EncodeUtilService } from "../utils/encode.service.util";
import type { User } from "../user/user.interface";
import type { BlockTransactionConstructor, Transaction } from "./transaction.interface";
export declare class BlockTransaction {
    readonly sender: string;
    readonly to: string;
    readonly amount: number;
    hash: string;
    indexBlock: number;
    blockHash: string;
    readonly encodeService: EncodeUtilService;
    readonly convertLaService: ConvertToLaService;
    readonly gasService: BlockChainGas;
    readonly users: Record<string, User>;
    timestamp: number;
    private keyService;
    fee: number;
    readonly signature: string;
    private readonly store;
    private readonly txActions;
    constructor({ sender, to, amount, indexBlock, blockHash, users, timestamp, signature, }: BlockTransactionConstructor);
    private createTransactionHash;
    createTransaction(): Transaction;
    private calculateFee;
    verifySign(data: string, signature: string, publicKey: string): boolean;
    private createCommission;
    private validate;
}
//# sourceMappingURL=transaction.d.ts.map
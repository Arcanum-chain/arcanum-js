import { Block } from "../block/block";
import type { Transaction } from "../transaction/transaction.interface";
import type { User } from "../user/user.interface";
export declare class BlockChain {
    chain: Block[];
    mappingChain: Record<string, Block>;
    readonly pendingTransactions: Transaction[];
    private readonly peers;
    private users;
    private blockChainUser;
    private verifyBlockService;
    private calculateRandomBlockToData;
    constructor();
    createGenesisBlock(): Block;
    getLatestBlock(): Block;
    getBlockByHash(blockHash: string): Block;
    addBlock(): Block;
    isValidChain(chain: Block[]): boolean;
    mineBlock(): Block | Error | undefined;
    replaceChain(newChain: Block[]): void;
    broadcastBlock(block: Block): void;
    broadcastUser(user: User): void;
    createTransaction({ sender, to, amount, }: {
        sender: string;
        to: string;
        amount: number;
    }): false | Transaction;
    addNewUserToChain(newUsers: User): boolean;
    createNewUser(): {
        user: {
            balance: string;
            publicKey: string;
            data: string;
        };
    };
    getUserBalance(address: string): number;
    getAllUsers(): User[];
    getUserSecrets(publicKey: string, sedCode: string): {
        privateKey: string;
        sedCode: string;
    };
    private minerReward;
}
//# sourceMappingURL=chain.d.ts.map
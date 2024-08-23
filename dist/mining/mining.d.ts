import { Block } from "../block/block";
export declare class MiningBlock {
    readonly minerAddress: string;
    private verifyBlockService;
    powPrefix: string;
    private readonly metadataStore;
    private readonly store;
    private readonly memPool;
    private readonly txActions;
    private readonly merkleTreeService;
    constructor(minerAddress: string);
    mineBlock(block: Block): Block;
    private calculateTxsMerkleRoot;
    private appendTxsToBlock;
    private appendCoinBaseTx;
    calculateDifficulty(): number;
}
//# sourceMappingURL=mining.d.ts.map
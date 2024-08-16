import { Block } from "../block/block";
export declare class MiningBlock {
    private verifyBlockService;
    powPrefix: string;
    private readonly metadataStore;
    private readonly store;
    constructor();
    mineBlock(block: Block): Block;
    calculateDifficulty(): number;
}
//# sourceMappingURL=mining.d.ts.map
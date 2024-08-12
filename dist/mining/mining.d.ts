import { Block } from "../block/block";
export declare class MiningBlock {
    private chain;
    private verifyBlockService;
    difficulty: number;
    powPrefix: string;
    constructor(chain: Block[]);
    mineBlock(block: Block): Block;
    calculateDifficulty(): number;
}
//# sourceMappingURL=mining.d.ts.map
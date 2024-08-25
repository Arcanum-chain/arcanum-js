import type { IBlockData } from "../blockData/blockData.interface";
import type { BlockConstructor } from "./block.interface";
export declare class Block {
    index: number;
    readonly timestamp: number;
    prevBlockHash: string;
    hash: string;
    data: IBlockData;
    verify: boolean;
    totalFeeRei: number;
    constructor({ index, timestamp, data, prevBlockHash, }: BlockConstructor);
    calculateHash(): string;
}
//# sourceMappingURL=block.d.ts.map
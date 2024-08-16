import type { IBlockData } from "@/blockData/blockData.interface";
export interface BlockConstructor {
    readonly index: number;
    readonly timestamp: number;
    readonly data: Omit<IBlockData, "blockHash">;
    prevBlockHash: string;
}
export interface IBlock {
    index: number;
    readonly timestamp: number;
    prevBlockHash: string;
    hash: string;
    readonly data: IBlockData;
}
//# sourceMappingURL=block.interface.d.ts.map
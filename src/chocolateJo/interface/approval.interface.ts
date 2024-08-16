import type { IBlock } from "../../block/block.interface";

export interface ApprovalBlock extends IBlock {
  approvalCount: number;
}

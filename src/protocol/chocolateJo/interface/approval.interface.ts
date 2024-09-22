import type { IBlock } from "../../../blockchain-common";

export interface ApprovalBlock extends IBlock {
  approvalCount: number;
}

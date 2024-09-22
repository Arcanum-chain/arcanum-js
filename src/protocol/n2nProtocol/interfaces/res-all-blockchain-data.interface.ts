import type { Transaction, IBlock, User } from "../../../blockchain-common";
import type { N2NNode, NodeList } from "./node.interface";

export interface ResponseGetAllBlockchainData {
  readonly list: NodeList;
  readonly actives: Record<string, N2NNode>;
  readonly blockChain: IBlock[];
  readonly users: User[];
  readonly txsInMemPool: Transaction[];
  readonly metadata: MetadataChain;
}

interface MetadataChain {
  readonly difficulty: number;
  readonly blockReward: number;
  readonly lastVerifyBlock: IBlock;
}

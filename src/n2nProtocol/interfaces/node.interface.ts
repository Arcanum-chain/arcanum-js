export interface N2NNode {
  url: string;
  timestamp: number;
  user: string;
  nodeId: string;
}

export type NodeList = Record<string, N2NNode[]>;

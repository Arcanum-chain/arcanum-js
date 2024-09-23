export interface N2NNode {
  url: string;
  timestamp: number;
  user: string;
  nodeId: string;
  lastActive: number;
  isActive: boolean;
  publicKey: string;
}

export type NodeList = Record<string, N2NNode[]>;

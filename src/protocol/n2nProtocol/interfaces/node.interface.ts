export interface N2NNode {
  url: string;
  user: string;
  nodeId: string;
  publicKey: string;
  udpPort: number;
  tcpPort: number;
}

export type NodeList = Record<string, N2NNode[]>;

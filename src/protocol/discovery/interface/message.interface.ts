export enum DiscoveryMsgType {
  FIRST_AUTH = "FIRST_AUTH",
}

export interface DiscoveryMessage<T extends {}> {
  readonly headers: {
    readonly nodeId: string;
    readonly timestamp: number;
    readonly origin: string;
    readonly version: number;
  };
  readonly payload: T;
}

export interface DptEndpoint {
  readonly nodeId: string;
  readonly address: string;
  readonly udpPort: number;
  readonly tcpPort: number;
}

export interface DPTServerOptions {
  readonly endpoint: DptEndpoint;
  readonly timeout?: number;
}

export interface DTPOptions {
  readonly endpoint: DptEndpoint;
  readonly timeout?: number;
  readonly onlyConfirmed?: boolean;
  readonly shouldFindNeighbours?: boolean;
}

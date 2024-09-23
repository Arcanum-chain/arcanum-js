import type { MessageTypes } from "../constants/message.types";

export interface N2NRequest {
  readonly message: MessageTypes;
  readonly payload: {
    readonly senderNodeId: string;
    readonly data: any;
    readonly ownerAddress?: string;
  };
  readonly headers: {
    readonly origin: string; // reinode protocol url
    readonly timestamp: number;
    readonly signature: string;
  };
}

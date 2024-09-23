import type { MessageTypes } from "../constants/message.types";

export interface N2NResponse<T> {
  readonly message: MessageTypes;
  readonly payload: {
    readonly data: T;
    readonly senderNodeId: string;
    readonly isMainNodeSender?: boolean;
  };
  readonly headers: {
    readonly signature: string;
    readonly origin: string; // reinode protocol url
    readonly timestamp: number;
  };
}

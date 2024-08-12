import type { MessageTypes } from "../constants/message.types";

export interface N2NResponse {
  readonly message: MessageTypes;
  readonly payload: {
    readonly data: any;
    readonly senderNodeId: string;
    readonly isMainNodeSender: boolean;
  };
}

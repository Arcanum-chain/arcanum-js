import type { MessageTypes } from "../constants/message.types";

export interface N2NRequest {
  message: MessageTypes;
  payload: {
    nodeId: string;
    data: any;
    publicKey?: string;
    origin: string;
  };
}

import WebSocket from "ws";

import { VerifyNode } from "../../verify-node/verify-node.service";
import { PeersStore } from "../../../store";

import type { N2NResponse } from "../interfaces";

export class VerifyNodeSignatureMiddleware {
  private readonly verifyNodeService: VerifyNode;
  private readonly peersStore = PeersStore;

  constructor() {
    this.verifyNodeService = new VerifyNode();
  }

  public async use(msg: N2NResponse<any>, ws: WebSocket) {
    try {
      const node = await this.peersStore.getNodeByNodeId(
        msg.payload.senderNodeId
      );

      const data = {
        nodeId: msg.payload.senderNodeId,
        timestamp: msg.headers.timestamp,
      };

      const isValid = await this.verifyNodeService.verifySignature({
        data,
        signature: msg.headers.signature,
        publicKey: node.publicKey,
      });

      if (isValid) {
        return true;
      } else {
        ws.close();
        return false;
      }
    } catch (e) {
      ws.close();
      throw e;
    }
  }
}

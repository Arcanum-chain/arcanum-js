import WebSocket from "ws";

import { Logger } from "../../../logger";

import { VerifyNode } from "../../verify-node/verify-node.service";
import { PeersStore } from "../../../store";
import { BanListPeersService } from "../../ban-list/ban-list.service";

import type { N2NResponse } from "../interfaces";

export class VerifyNodeSignatureMiddleware {
  private readonly verifyNodeService: VerifyNode;
  private readonly peersStore = PeersStore;
  private readonly banListService: BanListPeersService;
  private readonly logger = new Logger(VerifyNodeSignatureMiddleware.name);

  constructor() {
    this.verifyNodeService = new VerifyNode();
    this.banListService = BanListPeersService.getInstance();
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

      const isBanned = this.checkIsBannedPeer(data.nodeId);

      if (isBanned) {
        ws.close();
        return;
      }

      const isValid = await this.verifyNodeService.verifySignature({
        data,
        signature: msg.headers.signature,
        publicKey: node.publicKey,
      });

      if (isValid) {
        return true;
      } else {
        ws.close();
        this.banListService.add(data.nodeId, 300000);
        return false;
      }
    } catch (e) {
      ws.close();
      this.banListService.add(msg.payload.senderNodeId, 300000);
      this.logger.error(`Unverified node, node id ${msg.payload.senderNodeId}`);
      return;
    }
  }

  private checkIsBannedPeer(nodeId: string): boolean {
    try {
      const peer = this.banListService.get(nodeId);

      if (peer) {
        return true;
      }

      return false;
    } catch (e) {
      return true;
    }
  }
}

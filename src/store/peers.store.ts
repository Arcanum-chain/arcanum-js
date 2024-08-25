import EventEmitter from "events";

import { PeersEventMessage } from "../constants";

import { BlockChainError, BlockChainErrorCodes } from "../errors";
import type {
  N2NNode,
  NodeList,
} from "../n2nProtocol/interfaces/node.interface";

class PeersStore extends EventEmitter {
  public protocolNodes: NodeList = {};
  public protocolNodesActive: Record<string, N2NNode> = {};

  public setNewNode(newNode: N2NNode) {
    try {
      if (!this.protocolNodes[newNode.user]) {
        this.protocolNodes[newNode.user] = [];
      }

      if (
        this.protocolNodes[newNode.user].filter(
          ({ nodeId }) => nodeId === newNode.nodeId
        ).length > 0
      ) {
        throw new BlockChainError(BlockChainErrorCodes.DUPLICATE_DATA);
      }

      this.protocolNodes[newNode.user].push(newNode);
      this.protocolNodesActive[newNode.nodeId] = newNode;
      this.emit(PeersEventMessage.ADD_NEW_NODE, newNode);

      return true;
    } catch (e) {
      console.log(e);
    }
  }

  public get getAllNodes() {
    try {
      return this.protocolNodes;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public delActiveNode(nodeId: string) {
    try {
      const node = this.protocolNodesActive[nodeId];

      if (!node) {
        throw new Error();
      }

      const nodeOnList = this.protocolNodes[node.user].filter(
        ({ nodeId: id }) => id === nodeId
      )[0];

      if (!nodeOnList) throw new Error();

      nodeOnList.isActive = false;
      nodeOnList.lastActive = Date.now();

      delete this.protocolNodesActive[nodeId];
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public addActiveNode(nodeId: string, userPublicKey: string) {
    try {
      const node = this.protocolNodes[userPublicKey].filter(
        ({ nodeId: id }) => id === nodeId
      )[0];

      if (!node) {
        throw new Error();
      }

      if (this.protocolNodesActive[node.nodeId]) {
        return;
      }

      node.isActive = true;
      node.lastActive = Date.now();

      this.protocolNodesActive[node.nodeId] = node;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public getActiveNodes() {
    try {
      return Object.values(this.protocolNodesActive);
    } catch (e) {
      console.log(e);
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }
}

export default new PeersStore();

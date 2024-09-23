import EventEmitter from "events";

import { PeersEventMessage } from "../constants";

import { CocoAPI } from "../coconut-db/src/index";

import { BlockChainError, BlockChainErrorCodes } from "../errors";

import type { N2NNode, NodeList } from "../protocol";

class PeersStore extends EventEmitter {
  public protocolNodes: NodeList = {};
  public protocolNodesActive: Record<string, N2NNode> = {};
  private readonly cocoApi: CocoAPI;

  constructor() {
    super();

    this.cocoApi = CocoAPI.getInstance();
  }

  public async setNewNode(newNode: N2NNode) {
    try {
      await this.cocoApi.protocolRepo.n2nNodes.create({
        key: newNode.nodeId,
        data: newNode,
      });
      await this.cocoApi.protocolRepo.activeN2nNodes.create({
        key: newNode.nodeId,
        data: newNode,
      });
      this.emit(PeersEventMessage.ADD_NEW_NODE, newNode);

      return true;
    } catch (e) {
      console.log(e);
    }
  }

  public async getAllNodes() {
    try {
      const data = await this.cocoApi.protocolRepo.n2nNodes.findMany();

      return data;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public async getNodeByNodeId(nodeId: string) {
    try {
      const node = await this.cocoApi.protocolRepo.n2nNodes.findOne(nodeId);

      return node;
    } catch (e) {
      throw e;
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

  public async addActiveNode(nodeId: string, userPublicKey: string) {
    try {
      const node = await this.cocoApi.protocolRepo.activeN2nNodes.findOne(
        nodeId
      );

      node.isActive = true;
      node.lastActive = Date.now();

      await this.cocoApi.protocolRepo.activeN2nNodes.update({
        key: nodeId,
        updateData: node,
      });
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }

  public async getActiveNodes() {
    try {
      return await this.cocoApi.protocolRepo.activeN2nNodes.findMany();
    } catch (e) {
      console.log(e);
      throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
    }
  }
}

export default new PeersStore();

import { Singleton } from "../basic";

import { ConfigService } from "./config.service";
import { BlockLimits, NodeTypes } from "../constants";
import { Logger } from "../logger";

// Chain base
import { BlockChain } from "../blockchain-common/chain/chain";
import { MemPool } from "../blockchain-common/memPool/memPool";

// Protocols
import {
  ChocolateJo,
  N2NProtocol,
  MessageQueue,
  MessageTypes,
} from "../protocol";

// Clients
import { RestClient } from "../server";

// File manager
import { NodeFilesService } from "./node-files/node-files.service";

// FS safety
import { FsSecurity } from "../blockchain-safety";

import { CocoAPI } from "../coconut-db/src";

export class NodeStarter extends Singleton {
  private readonly blockchain: BlockChain;
  private readonly memPool: MemPool;
  public isStart: boolean = false;
  private readonly cfg: ConfigService;
  private n2nProtocol: N2NProtocol;
  private miningInterval: any;
  private readonly nodeFilesManagerService: NodeFilesService;
  private readonly cocoApi: CocoAPI = CocoAPI.getInstance();
  private readonly fsSecurity = new FsSecurity();
  private readonly logger = new Logger();
  private restClient?: RestClient;

  constructor() {
    super();

    NodeFilesService.createCommonDir();
    this.cfg = new ConfigService();

    this.blockchain = BlockChain.getInstance();
    this.memPool = MemPool.getInstance();
    this.n2nProtocol = new N2NProtocol(
      this.cfg.env.WS_PORT,
      this.cfg.env.WS_NODE_URL,
      this.cfg.env.OWNER_NODE_ADDRESS,
      {
        isMainNode: this.cfg.env.IS_MAIN_NODE,
      }
    );
    this.nodeFilesManagerService = new NodeFilesService();
  }

  public async start() {
    try {
      this.isStart = true;
      await this.nodeFilesManagerService.firstNodeInstance(this.cfg.env);

      const nodePubKey = await this.nodeFilesManagerService.getPublicKey();
      const nodeId = await this.nodeFilesManagerService.getNodeId();
      this.n2nProtocol.setNodePublicKey(nodePubKey);
      this.n2nProtocol.setNodeId = nodeId;

      await this.n2nProtocol.createServer();

      if (this.cfg.env.NODE_TYPE !== NodeTypes.MINER) {
        this.restClient = new RestClient(this.cfg.env.PORT);
        await this.restClient?.start();
      }

      const messageQueue = new MessageQueue(this.n2nProtocol, {});

      new ChocolateJo(this.n2nProtocol, messageQueue);

      // await this.cocoApi.getDataSource.meta.techMeta.clearAllDatabase();
      // await this.cocoApi.chainRepo.blocks.clearAllDatabase();
      // await this.cocoApi.chainRepo.meta.update({
      //   key: "chain-meta",
      //   updateData: {
      //     difficulty: 1,
      //   },
      // });
      // await this.blockchain.createGenesisBlock();

      this.fsSecurity.safetyFs();

      this.logger.info(
        `Start type node ${this.cfg.env.NODE_TYPE}... Happy hashing!`
      );

      if (this.cfg.env.NODE_TYPE === NodeTypes.MINER) {
        await this.startMining();
      }
    } catch (e) {
      throw e;
    }
  }

  public async startMining() {
    try {
      const minerAddress = this.cfg.env.OWNER_NODE_ADDRESS;

      this.miningInterval = setInterval(async () => {
        this.logger.info("MINING Starting mining block");
        const block = await this.blockchain.mineBlock(minerAddress);
        this.logger.info(
          `MINING Successful mined block by hash ${block?.hash}`
        );
      }, BlockLimits.DEFAULT_MINING_INTERVAL);
    } catch (e) {
      throw e;
    }
  }

  public stopMining() {
    try {
      clearInterval(this.miningInterval);
    } catch (e) {
      throw e;
    }
  }

  public async stop() {
    try {
      this.isStart = false;
      this.n2nProtocol?.closeServer();
      this.restClient?.closeServer();
    } catch (e) {
      throw e;
    }
  }
}

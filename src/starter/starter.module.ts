import { Singleton } from "../basic";

import { ConfigService } from "./config.service";
import { BlockLimits } from "../constants";
import { Logger } from "../logger";

// Chain base
import { BlockChain } from "../blockchain-common/chain/chain";
import { MemPool } from "../blockchain-common/memPool/memPool";

// Protocols
import { ChocolateJo, N2NProtocol } from "../protocol";

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

  constructor() {
    super();

    this.cfg = new ConfigService();

    this.blockchain = BlockChain.getInstance();
    this.memPool = MemPool.getInstance();
    this.n2nProtocol = new N2NProtocol(
      this.cfg.env.WS_PORT,
      this.cfg.env.WS_NODE_URL,
      "test",
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

      this.n2nProtocol.createServer();
      await new RestClient(this.cfg.env.PORT).start();
      new ChocolateJo(this.n2nProtocol);

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

      if (this.cfg.env.IS_SUPPORT_MINING) {
        await this.startMining();
      }
    } catch (e) {
      throw e;
    }
  }

  public async startMining() {
    try {
      const minerAddress =
        await this.nodeFilesManagerService.getNodeCreatorAddress();

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
    } catch (e) {
      throw e;
    }
  }
}

import { Singleton } from "../basic";

import { ConfigService } from "./config.service";

// Chain base
import { BlockChain } from "../chain/chain";
import { MemPool } from "../memPool/memPool";

// Protocols
import { ChocolateJo } from "../chocolateJo/chocolateJo";
import { N2NProtocol } from "../n2nProtocol/n2n.protocol";

// Clients
import { RestClient } from "../server";

export class NodeStarter extends Singleton {
  private readonly blockchain: BlockChain;
  private readonly memPool: MemPool;
  public isStart: boolean = false;
  private readonly cfg: ConfigService;
  private n2nProtocol: N2NProtocol;

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
  }

  public async start() {
    try {
      this.isStart = true;

      this.n2nProtocol.createServer();
      await new RestClient(this.cfg.env.PORT).start();
      new ChocolateJo(this.n2nProtocol);
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

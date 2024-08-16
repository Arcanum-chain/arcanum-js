import { Singleton } from "../basic";
import { Cron } from "../utils";

import { BlockChainStore } from "../store";

import { DumpingService } from "../dumping/dumping";

export class AutoScheduleService extends Singleton {
  private readonly blockChainStore: typeof BlockChainStore = BlockChainStore;
  private readonly dumpingService: DumpingService;

  constructor() {
    super();

    this.dumpingService = new DumpingService();
  }

  @Cron("0 0 * * *")
  public async autoDumpBlockchain() {
    try {
      const chain = this.blockChainStore.getChain();
      await this.dumpingService.dumpingBlockchain(chain);
    } catch (e) {
      console.log("Dumping blockchain error:", e);
    }
  }
}

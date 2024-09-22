import { Singleton } from "../../basic";
import { Cron } from "../../utils";

import { BlockChainStore } from "../../store";

import { DumpingService } from "../../dumping/dumping";
import { SecurityAssistent } from "../../blockchain-safety/security-assistent/security-assistent";

export class AutoScheduleService extends Singleton {
  private readonly blockChainStore: typeof BlockChainStore = BlockChainStore;
  private readonly dumpingService: DumpingService;
  private readonly securityAssistentService: SecurityAssistent;

  constructor() {
    super();

    this.dumpingService = new DumpingService();
    this.securityAssistentService = new SecurityAssistent();
  }

  @Cron("0 0 * * *")
  public async autoDumpBlockchain() {
    try {
      const chain = await this.blockChainStore.getChain();
      await this.dumpingService.dumpingBlockchain(chain);
    } catch (e) {
      console.log("Dumping blockchain error:", e);
    }
  }

  @Cron("0 */45 * * * *")
  public async checkIsValidChain() {
    try {
      const chain = await this.blockChainStore.getChain();
      const isValidChain = this.securityAssistentService.verifyAllChain(chain);

      if (isValidChain) {
        console.log("[System]: Chain valid!");
      }
    } catch (e) {
      console.log(e);
    }
  }
}

import { DumpingService } from "../dumping/dumping";
import { BlockChainStore } from "../store";

import type { IBlock } from "../block/block.interface";

export class Node2NodeAdapter {
  private readonly store: typeof BlockChainStore = BlockChainStore;
  private readonly dumpService: DumpingService;

  constructor() {
    this.dumpService = new DumpingService();
  }

  public synchronizeBlockChain(chain: IBlock[]) {
    try {
      this.store.synchronizeChain(chain);
      this.dumpService.dumpingBlockchain(chain);
    } catch (e) {
      throw e;
    }
  }
}

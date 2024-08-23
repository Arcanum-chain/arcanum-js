import { DumpingService } from "../dumping/dumping";
import { BlockChainStore, MetadataBlockchainStore } from "../store";

import type { MetadataBlockchain } from "@/basic/interface/metadata.blockchain";
import type { Transaction } from "@/transaction/transaction.interface";
import type { IBlock } from "../block/block.interface";
import type { User } from "../user/user.interface";

export class Node2NodeAdapter {
  private readonly store: typeof BlockChainStore = BlockChainStore;
  private readonly metadataStore: typeof MetadataBlockchainStore =
    MetadataBlockchainStore;
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

  public synchronizeUser(users: User[]) {
    try {
      this.store.synchronizeUser(users);
      this.dumpService.dumpingUsers(users);
    } catch (e) {
      throw e;
    }
  }

  public synchronizeTxMemPool(txs: Transaction[]) {
    try {
      this.store.synchronizeTxMemPool(txs);
      this.dumpService.dumpingTxsMemPool(txs);
    } catch (e) {
      throw e;
    }
  }

  public async synchronizeMetadata(meta: MetadataBlockchain) {
    try {
      this.metadataStore.synchronizeMetadata(meta);
      this.dumpService.dumpingMetadataChain(meta);
    } catch (e) {
      throw e;
    }
  }
}

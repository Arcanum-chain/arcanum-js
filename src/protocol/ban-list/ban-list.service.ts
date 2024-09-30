import { LRUCache } from "lru-cache";

import { Singleton } from "../../basic";
import { Logger } from "../../logger";
import { KBucket } from "../k-bucket/k-bucket.service";

export class BanListPeersService extends Singleton {
  /* 
  @key = nodeId, 
  @value = address 
  */
  private banList: LRUCache<string, boolean>;
  private readonly logger = new Logger();
  private readonly kBucket: KBucket;

  constructor() {
    super();
    this.banList = new LRUCache({ max: 10000 });
    this.kBucket = KBucket.getInstance();
  }

  public has(key: string): boolean {
    try {
      return this.banList.has(key);
    } catch (e) {
      return false;
    }
  }

  public get(nodeId: string) {
    try {
      return this.banList.get(nodeId);
    } catch (e) {
      return undefined;
    }
  }

  public add(nodeId: string, maxAge?: number) {
    try {
      this.banList.set(nodeId, true, { ttl: maxAge });
    } catch (e) {
      this.logger.error(
        `PEERS_BAN_LIST Can not be add node ${nodeId} to save in ban list
         Details: ${(e as Error).message}
        `
      );
    }
  }

  public del(nodeId: string) {
    try {
      this.banList.delete(nodeId);
    } catch {
      this.logger.error(`PEERS_BAN_LIST Can not delete item by key ${nodeId}`);
    }
  }

  public clearAll() {
    this.banList.clear();
  }

  public getAllBanList() {
    return new Promise((res) => {
      try {
        const arr = Object.values(this.banList.values());

        res(arr);
      } catch {
        this.logger.error("PEERS_BAN_LIST Can not get all ban list");
        res([]);
      }
    });
  }
}

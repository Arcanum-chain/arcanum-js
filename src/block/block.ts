import { VerifyBlockService } from "../utils";

import { DEFAULT_HASH_PREFIX } from "../constants/default.hash.prefix";

import type { IBlockData } from "../blockData/blockData.interface";
import type { BlockConstructor } from "./block.interface";

export class Block {
  public index: number;
  public readonly timestamp: number;
  public prevBlockHash: string = "";
  public hash: string = "";
  public data: IBlockData;
  public verify: boolean = false;
  public totalFeeRei: number = 0;
  public nonce: number = 0;

  private readonly hashService: VerifyBlockService;

  constructor({
    index,
    timestamp,
    data,
    prevBlockHash = "",
  }: BlockConstructor) {
    this.hashService = new VerifyBlockService();

    this.index = index;
    this.timestamp = timestamp;
    this.prevBlockHash = prevBlockHash;
    this.hash = this.calculateHash();
    this.data = { ...data, blockHash: this.hash };
  }

  public calculateHash(): string {
    const payload = JSON.stringify({
      index: this.index,
      timestamp: this.timestamp,
      prevBlockHash: this.prevBlockHash,
      data: JSON.stringify(this.data),
    });

    // const hash = `${DEFAULT_HASH_PREFIX}${createHash("sha256")
    //   .update(payload)
    //   .digest("hex")}`;

    const hash = `${DEFAULT_HASH_PREFIX}${this.hashService.genHash(payload)}`;

    this.hash = hash;

    return hash;
  }
}

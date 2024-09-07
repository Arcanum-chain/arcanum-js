import crypto from "node:crypto";

import { keccak256 } from "js-sha3";

import { BlockChainError, BlockChainErrorCodes } from "../errors";

import { DEFAULT_HASH_PREFIX } from "../constants/default.hash.prefix";

export class VerifyBlockService {
  public isHashProofed({
    hash,
    difficulty = 5,
    prefix = "0",
  }: {
    hash: string;
    difficulty?: number;
    prefix?: string;
  }) {
    try {
      const check = prefix.repeat(difficulty);
      return hash.startsWith(check);
    } catch (e) {
      throw e;
    }
  }

  public isHashValid(hash: string) {
    try {
      if (hash.startsWith(DEFAULT_HASH_PREFIX)) {
        return true;
      }

      throw new BlockChainError(BlockChainErrorCodes.INVALID_HASH_BLOCK);
    } catch (e) {
      throw e;
    }
  }

  public genHash(data: string): string {
    try {
      return keccak256(crypto.createHash("sha256").update(data).digest("hex"));
    } catch (e) {
      throw e;
    }
  }
}

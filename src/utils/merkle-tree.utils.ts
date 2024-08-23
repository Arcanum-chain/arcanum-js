import { VerifyBlockService } from "./verify.block.util.service";

import { BlockChainError, BlockChainErrorCodes } from "../errors";

import type { Transaction } from "@/transaction/transaction.interface";

export class MerkleTree {
  private readonly verifyBlockService: VerifyBlockService;

  constructor() {
    this.verifyBlockService = new VerifyBlockService();
  }

  public buildTxsMerkleTree(tx: Transaction[]) {
    if (tx.length === 1) {
      return {
        root: this.verifyBlockService.genHash(tx[0].hash),
      };
    }

    const pairs = [];
    for (let i = 0; i < tx.length - 1; i += 2) {
      pairs.push(tx.slice(i, i + 2));
    }
    if (tx.length % 2 !== 0) {
      pairs[pairs.length - 1].push(tx[tx.length - 1]);
    }

    let subtrees = pairs.map((pair) => {
      if (pair.length > 1) {
        return {
          root: this.verifyBlockService.genHash(pair[0].hash + pair[1].hash),
          leaves: [pair[0], pair[1]],
        };
      } else {
        return {
          root: this.verifyBlockService.genHash(pair[0].hash),
          leaves: [pair[0]],
        };
      }
    });

    let roots = subtrees.map((subtree) => subtree.root);
    let newRoot = this.verifyBlockService.genHash(roots.join(""));

    return {
      root: newRoot,
    };
  }

  public verifyTxsMerkleTree(rootHash: string, txs: Transaction[]): boolean {
    try {
      const { root: newRootHash } = this.buildTxsMerkleTree(txs);

      if (rootHash === newRootHash) {
        return true;
      }

      throw new Error();
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.INVALID_TXS_ROOT_HASH);
    }
  }
}

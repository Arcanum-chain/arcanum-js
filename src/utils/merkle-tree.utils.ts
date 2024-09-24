import { MerkleTree as merkleTree } from "merkletreejs";
import { SHA256 } from "crypto-js";

import { BlockChainError, BlockChainErrorCodes } from "../errors";

import type { Transaction } from "../blockchain-common";

export class MerkleTree {
  private readonly tree;
  private readonly rootHash: string;

  constructor(txs: Transaction[]) {
    const leaves = txs.map((x) => SHA256(JSON.stringify(x)));
    this.tree = new merkleTree(leaves, SHA256);
    this.rootHash = this.tree.getRoot().toString("hex");
  }

  public get getTree() {
    return this.tree;
  }

  public get getRootHash() {
    return this.rootHash;
  }

  public verifyTxInMerkleTree(tx: Transaction): boolean {
    try {
      const leaf = SHA256(JSON.stringify(tx)).toString();
      const proof = this.tree.getProof(leaf);
      const isValid = this.tree.verify(proof, leaf, this.rootHash);

      if (isValid) {
        return true;
      }

      throw Error();
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.INVALID_TXS_ROOT_HASH);
    }
  }
}

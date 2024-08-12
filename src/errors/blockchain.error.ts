import {
  BlockChainErrorCodes,
  BlockChainTextError,
} from "./blockchain.code.errors";

export class BlockChainError extends Error {
  public code: number;

  constructor(code: BlockChainErrorCodes) {
    super(BlockChainTextError[code]);

    this.code = code;
  }
}

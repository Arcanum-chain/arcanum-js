import {
  BlockChainErrorCodes,
  BlockChainTextError,
} from "./blockchain.code.errors";

export class BlockChainError extends Error {
  public code: number;

  constructor(code: BlockChainErrorCodes) {
    const error = BlockChainTextError[code];

    super(typeof error === "string" ? error : error());

    this.code = code;
  }
}

import type { Response } from "express";

import { BlockChainError } from "../../../../errors";

import { RestApiError } from "../";
import { TranslateBlockchainErrorToHttpError } from "../translate-blockchain-errors/translater-errors";

export function TransformError() {
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      let res = args[1] as Response;
      try {
        const executionMethod = await originalMethod.apply(this, args);
        return executionMethod;
      } catch (err) {
        if (err instanceof BlockChainError) {
          const status = TranslateBlockchainErrorToHttpError[err.code];

          throw new RestApiError(err.message, status);
        }

        if (err instanceof RestApiError) {
          throw err;
        }

        throw new RestApiError("Unknown error", 500);
      }
    };
  };
}

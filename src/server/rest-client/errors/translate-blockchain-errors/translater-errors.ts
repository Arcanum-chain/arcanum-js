import { BlockChainErrorCodes } from "../../../../errors";

export const TranslateBlockchainErrorToHttpError: Record<number, number> = {
  [BlockChainErrorCodes.BAD_DATA]: 400,
  [BlockChainErrorCodes.BAD_GATEWAY]: 400,
  [BlockChainErrorCodes.CONNECT_NODE_ERROR]: 500,
  [BlockChainErrorCodes.DOESNT_NOT_BLOCK_BY_HASH]: 404,
  [BlockChainErrorCodes.DUPLICATE_DATA]: 403,
  [BlockChainErrorCodes.ERROR_IN_METADATA_STORE]: 500,
  [BlockChainErrorCodes.FAIL_COINBASE_TX]: 500,
  [BlockChainErrorCodes.FAIL_CREATE_DIR]: 500,
  [BlockChainErrorCodes.FAIL_SAVE_NEW_USER_TO_STORE]: 500,
  [BlockChainErrorCodes.FAIL_SAVE_TRANSACTION_TO_MEM_PULL]: 500,
  [BlockChainErrorCodes.INVALID_CONSENSUS_STATUS]: 403,
  [BlockChainErrorCodes.NOT_FOUND_ENTITY]: 404,
};

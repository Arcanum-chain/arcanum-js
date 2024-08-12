export enum BlockChainErrorCodes {
  CONNECT_NODE_ERROR = 100,
  INVALID_CONSENSUS_STATUS = 101,
  INVALID_USERS_DATA_BY_NODE = 102,
  INVALID_TRANSACTIONS_DATA_BY_NODE = 103,
  INVALID_VERIFY_NEW_NODE = 104,
  INVALID_HASH_BLOCK = 201,
  BAD_GATEWAY = 200,
  DUPLICATE_DATA = 203,
  FAIL_BLOCKCHAIN_DUMP = 300,
  FAIL_NODES_DUMP = 301,
  FAIL_CREATE_DIR = 302,
  FAIL_NODE_ID_DUMP = 303,
}

export const BlockChainTextError: Record<BlockChainErrorCodes, string> = {
  [BlockChainErrorCodes.CONNECT_NODE_ERROR]: "Connect node error!!!",
  [BlockChainErrorCodes.INVALID_CONSENSUS_STATUS]:
    "Invalid consensus in you node!!!",
  [BlockChainErrorCodes.INVALID_USERS_DATA_BY_NODE]:
    "Invalid user data(decipher error)!!!",
  [BlockChainErrorCodes.INVALID_TRANSACTIONS_DATA_BY_NODE]:
    "Invalid decrypted transaction data!!! Is valid encrypt?",
  [BlockChainErrorCodes.INVALID_VERIFY_NEW_NODE]:
    "Invalid verify new node by nodeId:",
  [BlockChainErrorCodes.INVALID_HASH_BLOCK]: "Invalid block hash!!!",
  [BlockChainErrorCodes.BAD_GATEWAY]: "Invalid data to request node!!!",
  [BlockChainErrorCodes.DUPLICATE_DATA]: "Duplicate data in blockchain!!!",
  [BlockChainErrorCodes.FAIL_BLOCKCHAIN_DUMP]:
    "Fail this blockchain dump!!! Please check your PC!!!",
  [BlockChainErrorCodes.FAIL_NODES_DUMP]:
    "Fail this nodes n2n protocol dumps!!!",
  [BlockChainErrorCodes.FAIL_CREATE_DIR]:
    "Fail create data directory(/.ravkchain)!!!",
  [BlockChainErrorCodes.FAIL_NODE_ID_DUMP]: "Fail node id save to file!!!",
};

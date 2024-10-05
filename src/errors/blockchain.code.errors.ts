export enum BlockChainErrorCodes {
  CONNECT_NODE_ERROR = 100,
  IS_MY_NODE = 105,
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
  DOESNT_NOT_BLOCK_BY_HASH = 400,
  FAIL_SYNCHRONIZE_CHAIN = 401,
  FAIL_SYNCHRONIZE_CHAIN_METADATA = 406,
  FAIL_SAVE_NEW_USER_TO_STORE = 402,
  NOT_FOUND_ENTITY = 403,
  FAIL_SAVE_TRANSACTION_TO_MEM_PULL = 404,
  ERROR_IN_METADATA_STORE = 405,
  INVALID_VERIFY_TRANSACTION = 500,
  INVALID_USER_KEY = 501,
  FAIL_COINBASE_TX = 600,
  BAD_DATA = 601,
  FAIL_ROLLBACK_CB_TX = 602,
  INVALID_TXS_ROOT_HASH = 603,
  GENESIS_BLOCK_EXIST = 106,
  CREATE_DIR_ERROR = 1100,
  INSUFFICIENT_FUNDS = 1101,
}

export const BlockChainTextError: Record<
  BlockChainErrorCodes,
  string | Function
> = {
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
    "Fail create data directory(/.arcanum)!!!",
  [BlockChainErrorCodes.FAIL_NODE_ID_DUMP]: "Fail node id save to file!!!",
  [BlockChainErrorCodes.DOESNT_NOT_BLOCK_BY_HASH]:
    "Not block in chain by this hash!",
  [BlockChainErrorCodes.FAIL_SYNCHRONIZE_CHAIN]:
    "Fail synchronize new chain!!!",
  [BlockChainErrorCodes.FAIL_SAVE_NEW_USER_TO_STORE]:
    "Fail save new user to store!!!",
  [BlockChainErrorCodes.NOT_FOUND_ENTITY]: "Not found entity :(",
  [BlockChainErrorCodes.FAIL_SAVE_TRANSACTION_TO_MEM_PULL]:
    "Fail save transaction to mempull!!!",
  [BlockChainErrorCodes.ERROR_IN_METADATA_STORE]: "Error in metadata store!!!",
  [BlockChainErrorCodes.INVALID_VERIFY_TRANSACTION]:
    "Invalid verify transaction!!!",
  [BlockChainErrorCodes.INVALID_USER_KEY]:
    "Invalid user key, permission denied!!!",
  [BlockChainErrorCodes.IS_MY_NODE]: "You node doesnt verify you block!!!",
  [BlockChainErrorCodes.FAIL_COINBASE_TX]:
    "Fail coinbase transaction to miner!!!",
  [BlockChainErrorCodes.BAD_DATA]: "Invalid data!!!",
  [BlockChainErrorCodes.FAIL_ROLLBACK_CB_TX]:
    "Fail rollback coinbase transaction!",
  [BlockChainErrorCodes.FAIL_SYNCHRONIZE_CHAIN_METADATA]:
    "Fail synchronize chain metadata!!!",
  [BlockChainErrorCodes.INVALID_TXS_ROOT_HASH]:
    "Invalid transactions in block root hash!!!",
  [BlockChainErrorCodes.GENESIS_BLOCK_EXIST]:
    "Genesis block has already exist!!!",
  [BlockChainErrorCodes.CREATE_DIR_ERROR]: `Create dir error`,
  [BlockChainErrorCodes.INSUFFICIENT_FUNDS]: "Insufficient funds",
};

export enum EventMessage {
  BLOCK_ADDED = "block_add",
  USER_ADDED = "user_add",
  TRANSACTION_ADD_IN_MEMPOOL = "transaction_add_in_mempool",
  UPDATE_USER_BALANCE = "UPDATE_USER_BALANCE",
}

export enum PeersEventMessage {
  ADD_NEW_NODE = "add_new_node",
  ON_CLOSE_NODE = "on_close_node",
}

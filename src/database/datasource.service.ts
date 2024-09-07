import { Singleton } from "../basic";

import { BlocksDatabase } from "./dbs/blocks-database.service";
import { TxsDatabase } from "./dbs/txs-database.service";
import { UsersDatabase } from "./dbs/users-database.service";

export class DataSource extends Singleton {
  public readonly blocks: BlocksDatabase;
  public readonly txs: TxsDatabase;
  public readonly users: UsersDatabase;

  constructor() {
    super();

    this.blocks = BlocksDatabase.getInstance();
    this.txs = TxsDatabase.getInstance();
    this.users = UsersDatabase.getInstance();
  }
}

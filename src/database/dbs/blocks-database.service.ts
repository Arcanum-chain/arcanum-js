import levelup from "levelup";
import os from "node:os";
import path from "node:path";
import rocksdb from "rocksdb";

import { Singleton } from "../../basic";

import { DatabaseConstants } from "../../constants";
// import { BlockChainError, BlockChainErrorCodes } from "../../errors";

import type { IBlock } from "../../block/block.interface";
import type { CreateEntityDto } from "../dto/create-entity.dto";
import type {
  DatabaseInterface,
  KeyValue,
} from "../interface/database.interface";

export class BlocksDatabase
  extends Singleton
  implements DatabaseInterface<IBlock>
{
  private readonly db = levelup(
    new rocksdb(
      path.join(
        os.homedir(),
        DatabaseConstants.ROOT_DB_PATH,
        DatabaseConstants.BLOCK_DB_PATH
      )
    ),
    {
      createIfMissing: true,
    }
  );

  constructor() {
    super();
  }

  public getRepo() {
    try {
      return this.db;
    } catch (e) {
      throw e;
    }
  }

  public async create<T>(dto: CreateEntityDto<T>): Promise<"Ok"> {
    try {
      const serializeData = JSON.stringify(dto.data);

      await this.getRepo().put(dto.key, serializeData);

      return "Ok";
    } catch (e) {
      throw e;
    }
  }

  public async findOne(key: string): Promise<IBlock> {
    try {
      const data = await this.getRepo().get(key);
      const deserializeData: IBlock = JSON.parse(data.toString());

      return deserializeData;
    } catch (e) {
      throw e;
    }
  }

  public findMany(): Promise<IBlock[]> {
    return new Promise((resolve, reject) => {
      try {
        const arrData: IBlock[] = [];

        this.getRepo()
          .createReadStream()
          .on("data", (data: KeyValue<IBlock>) => {
            const normVal: IBlock = JSON.parse(data.value.toString());

            arrData.push(normVal);
          })
          .on("end", () => {
            resolve(arrData);
          });
      } catch (e) {
        reject(e);
      }
    });
  }

  public async clearAllDatabase() {
    try {
      await this.db.clear();
    } catch (e) {
      throw e;
    }
  }
}

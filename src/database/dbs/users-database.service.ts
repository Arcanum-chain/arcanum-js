import levelup from "levelup";
import os from "node:os";
import path from "node:path";
import rocksdb from "rocksdb";

import { Singleton } from "../../basic";

import { DatabaseConstants } from "../../constants";

import type { User } from "../../user/user.interface";
import type { CreateEntityDto } from "../dto/create-entity.dto";
import type {
  DatabaseInterface,
  KeyValue,
} from "../interface/database.interface";

export class UsersDatabase
  extends Singleton
  implements DatabaseInterface<User>
{
  private readonly db = levelup(
    new rocksdb(
      path.join(
        os.homedir(),
        DatabaseConstants.ROOT_DB_PATH,
        DatabaseConstants.USER_DB_PATH
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

  public async findOne(key: string): Promise<User> {
    try {
      const data = await this.getRepo().get(key);
      const deserializeData: User = JSON.parse(data.toString());

      return deserializeData;
    } catch (e) {
      throw e;
    }
  }

  public findMany(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      try {
        const arrData: User[] = [];

        this.getRepo()
          .createReadStream()
          .on("data", (data: KeyValue<User>) => {
            const normVal: User = JSON.parse(data.value.toString());

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

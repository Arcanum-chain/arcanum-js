import levelup from "levelup";
import os from "node:os";
import path from "node:path";
import rocksdb from "rocksdb";

import { Singleton } from "../../basic";

import { DatabaseConstants } from "../../constants";
// import { BlockChainError, BlockChainErrorCodes } from "../../errors";

import { MetaChain, MetaFields } from "../../interface";
import type { CreateEntityDto } from "../dto/create-entity.dto";
import type { KeyValue } from "../interface/database.interface";

export class MetaDatabase extends Singleton {
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

  public async createMetaState(data: { key: MetaFields; data: any }[]) {
    try {
      await Promise.all(
        data.map(async ({ key, data }) => {
          await this.createField({ key, data });
        })
      );
    } catch (e) {
      throw e;
    }
  }

  public async createField<T>(dto: CreateEntityDto<T>): Promise<"Ok"> {
    try {
      const serializeData = JSON.stringify(dto.data);

      await this.getRepo().put(dto.key, serializeData);

      return "Ok";
    } catch (e) {
      throw e;
    }
  }

  public async findOneFiled(field: MetaFields): Promise<MetaChain> {
    try {
      const data = await this.getRepo().get(field);
      const deserializeData: KeyValue<MetaChain> = JSON.parse(data.toString());

      return deserializeData.value;
    } catch (e) {
      throw e;
    }
  }

  public async findAllFields(): Promise<(string | number)[]> {
    try {
      const keys = [
        MetaFields.BLOCK_REWARD,
        MetaFields.DIFFICULTY,
        MetaFields.LAST_VERIFY_BLOCK_IN_CHAIN,
        MetaFields.TOTAL_SUPPLY,
      ];

      const data: KeyValue<string | number>[] = JSON.parse(
        (await this.getRepo().getMany(keys)).toString()
      );

      return data.map(({ value }) => value);
    } catch (e) {
      throw e;
    }
  }

  public async clearAllDatabase() {
    try {
      await this.db.clear();
    } catch (e) {
      throw e;
    }
  }
}

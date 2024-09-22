import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { MetadataBlockchain } from "@/basic/interface/metadata.blockchain";
import type { Transaction, User, IBlock } from "../blockchain-common";
import { DefaultDumpingPaths } from "../constants";
import { BlockChainError, BlockChainErrorCodes } from "../errors";

export class DumpingService {
  constructor() {
    this.createDataDir();
  }

  public async dumpingBlockchain(blockchain: IBlock[]) {
    try {
      await Promise.all(
        blockchain.map(async (block) => {
          return await this.writableDataBlockchain(
            block,
            `${DefaultDumpingPaths.BLOCKS_DIR}/${block.index}`
          );
        })
      );
    } catch (e) {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_BLOCKCHAIN_DUMP);
    }
  }

  public async dumpingUsers(users: User[]) {
    try {
      console.log(users);
      await Promise.all(
        users.map(async (user, i) => {
          return await this.writableDataBlockchain(
            user,
            `${DefaultDumpingPaths.USERS_DIR}/${i}`
          );
        })
      );
    } catch (e) {
      console.log(e);
      throw new BlockChainError(BlockChainErrorCodes.FAIL_BLOCKCHAIN_DUMP);
    }
  }

  public async dumpingNewBlock(newBlock: IBlock) {
    try {
      // await this.writableDataBlockchain(
      //   newBlock,
      //   `${DefaultDumpingPaths.BLOCKS_DIR}/${newBlock.index}`
      // );
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_BLOCKCHAIN_DUMP);
    }
  }

  public async dumpingTxsMemPool(txs: Transaction[]) {
    try {
      await this.writableDataBlockchain(txs, DefaultDumpingPaths.TXS_MEMPOOL);
    } catch (e) {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_BLOCKCHAIN_DUMP);
    }
  }

  public async dumpingMetadataChain(meta: MetadataBlockchain) {
    try {
      await this.writableDataBlockchain(
        meta,
        DefaultDumpingPaths.CHAIN_METADATA_FILE_PATH
      );
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_BLOCKCHAIN_DUMP);
    }
  }

  public async saveNodeIdN2N(id: string) {
    try {
      await this.writableDataBlockchain(id, DefaultDumpingPaths.NODE_ID_FILE);
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_NODE_ID_DUMP);
    }
  }

  private async writableDataBlockchain(data: any, outputFilePath: string) {
    try {
      const writedData = JSON.stringify(data);

      const homeDir = os.homedir();

      const filePath = path.join(
        homeDir,
        DefaultDumpingPaths.BLOCKCHAIN_DATA_PATH_DIR,
        outputFilePath
      );

      await fs.writeFile(filePath, writedData);
    } catch (e) {
      console.log(e);
      throw new BlockChainError(BlockChainErrorCodes.FAIL_BLOCKCHAIN_DUMP);
    }
  }

  private async createBlocksDir() {
    try {
      const homeDir = os.homedir();
      const dirPath = path.join(
        homeDir,
        DefaultDumpingPaths.BLOCKCHAIN_DATA_PATH_DIR,
        DefaultDumpingPaths.BLOCKS_DIR
      );
      const isNotEmpty = await fs
        .access(dirPath)
        .then(() => true)
        .catch(() => false);

      if (isNotEmpty) {
        return;
      }

      await fs.mkdir(dirPath);
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_CREATE_DIR);
    }
  }

  private async createUsersDir() {
    try {
      const homeDir = os.homedir();
      const dirPath = path.join(
        homeDir,
        DefaultDumpingPaths.BLOCKCHAIN_DATA_PATH_DIR,
        DefaultDumpingPaths.USERS_DIR
      );
      const isNotEmpty = await fs
        .access(dirPath)
        .then(() => true)
        .catch(() => false);

      if (isNotEmpty) {
        return;
      }

      await fs.mkdir(dirPath);
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_CREATE_DIR);
    }
  }

  private async createDataDir() {
    try {
      const homeDir = os.homedir();
      const dirPath = path.join(
        homeDir,
        DefaultDumpingPaths.BLOCKCHAIN_DATA_PATH_DIR
      );
      const isNotEmpty = await fs
        .access(dirPath)
        .then(() => true)
        .catch(() => false);

      if (isNotEmpty) {
        return;
      }

      await fs.mkdir(dirPath);

      this.createBlocksDir();
      this.createUsersDir();
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_CREATE_DIR);
    }
  }
}

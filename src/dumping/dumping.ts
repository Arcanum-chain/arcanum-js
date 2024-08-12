import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { Block } from "../block/block";
import { DefaultDumpingPaths } from "../constants";
import { BlockChainError, BlockChainErrorCodes } from "../errors";

export class DumpingService {
  constructor() {
    this.createDataDir();
  }

  public async dumpingBlockchain(blockchain: Block[]) {
    try {
      await this.writableDataBlockchain(
        blockchain,
        DefaultDumpingPaths.BLOCKCHAIN_DATA_PATH_FILE
      );
    } catch (e) {
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
      throw new BlockChainError(BlockChainErrorCodes.FAIL_BLOCKCHAIN_DUMP);
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
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.FAIL_CREATE_DIR);
    }
  }
}

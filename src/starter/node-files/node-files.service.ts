import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { NodeFilesPaths, DEFAULT_HASH_PREFIX } from "../../constants";
import { BlockChainError, BlockChainErrorCodes } from "../../errors";
import { KeyEnvsObj } from "../models/env.models";
import { KeyService } from "../../utils";

export class NodeFilesService {
  private readonly keyService: KeyService;

  constructor() {
    this.keyService = new KeyService();

    this.createDir(NodeFilesPaths.KEYS_DIR);
  }

  public async firstNodeInstance(env: KeyEnvsObj) {
    try {
      const pathToCreatorNodeAddress = `${NodeFilesPaths.KEYS_DIR}/${NodeFilesPaths.CREATOR_NODE_ADDRESS_FILE_NAME}`;
      await this.writeFile(pathToCreatorNodeAddress, env.OWNER_NODE_ADDRESS);

      const { privateKey, publicKey } = await this.keyService.generateKeyPair();

      const pathToPrivateKey = `${NodeFilesPaths.KEYS_DIR}/${NodeFilesPaths.PRIVATE_KEY_FILE_NAME}`;
      await this.writeFile(
        pathToPrivateKey,
        this.keyService.addHeadersToKey(privateKey, "PRIVATE")
      );

      const pathToPublicKey = `${NodeFilesPaths.KEYS_DIR}/${NodeFilesPaths.PUBLIC_KEY_FILE_NAME}`;
      await this.writeFile(
        pathToPublicKey,
        this.keyService.addHeadersToKey(publicKey, "PUBLIC")
      );
    } catch (e) {
      throw new Error(
        `[FIRST_NODE_INSTANCE]: Instance error, please check config\nDetails: ${
          (e as Error).message
        }`
      );
    }
  }

  public async getNodeCreatorAddress(): Promise<string> {
    try {
      const data: string = await this.readFile(
        `${NodeFilesPaths.KEYS_DIR}/${NodeFilesPaths.CREATOR_NODE_ADDRESS_FILE_NAME}`
      );

      if (!data.startsWith(DEFAULT_HASH_PREFIX)) {
        throw new Error("Invalid hash prefix!");
      }

      return data;
    } catch (e) {
      throw new Error(
        `[FS]: Get node creator address file data error!\nDetails: ${
          (e as Error).message
        }`
      );
    }
  }

  public async getPrivateKey(): Promise<string> {
    try {
      const data: string = await this.readFile(
        `${NodeFilesPaths.KEYS_DIR}/${NodeFilesPaths.PRIVATE_KEY_FILE_NAME}`
      );

      if (data.length === 0) {
        throw new Error("Not found data");
      }

      return data;
    } catch (e) {
      throw new Error(
        `FS Get node private key error!\nDetails: ${(e as Error).message}`
      );
    }
  }

  public async getPublicKey() {
    try {
      const data: string = await this.readFile(
        `${NodeFilesPaths.KEYS_DIR}/${NodeFilesPaths.PUBLIC_KEY_FILE_NAME}`
      );

      if (data.length === 0) {
        throw new Error("Not found data");
      }

      return data;
    } catch (e) {
      throw new Error(
        `FS Get node public key error!\nDetails: ${(e as Error).message}`
      );
    }
  }

  public async getNodeId(): Promise<string> {
    try {
      const data = await this.readFile(`${NodeFilesPaths.NODE_ID_FILE_NAME}`);

      if (!data) {
        throw new Error();
      }

      return data;
    } catch (e) {
      throw e;
    }
  }

  private async readFile(pathToFile: string) {
    try {
      const homedir = os.homedir();
      const filePath = path.resolve(
        homedir,
        NodeFilesPaths.COMMON_DIR,
        pathToFile
      );

      const data = await fs.readFile(filePath, { encoding: "utf-8" });

      if (!data) {
        throw new Error();
      }

      return JSON.parse(data);
    } catch (e) {
      throw e;
    }
  }

  private async writeFile<T>(pathToFile: string, data: T) {
    try {
      const homedir = os.homedir();
      const filePath = path.resolve(
        homedir,
        NodeFilesPaths.COMMON_DIR,
        pathToFile
      );
      const stringifyData = JSON.stringify(data);

      const isNotEmpty = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);

      if (isNotEmpty) {
        return;
      }

      await fs.writeFile(filePath, stringifyData, { encoding: "utf-8" });
    } catch (e) {
      throw e;
    }
  }

  private async createDir(pathToDir: string) {
    try {
      const homeDir = os.homedir();
      const dirPath = path.join(homeDir, NodeFilesPaths.COMMON_DIR, pathToDir);
      const isNotEmpty = await fs
        .access(dirPath)
        .then(() => true)
        .catch(() => false);

      if (isNotEmpty) {
        return;
      }

      await fs.mkdir(dirPath);
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.CREATE_DIR_ERROR);
    }
  }
}

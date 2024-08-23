import fs from "fs/promises";
import os from "os";
import path from "path";

import { DefaultDumpingPaths } from "../constants/defult.dumping.paths";

export class RecoverService {
  private readonly homeDir: string = os.homedir();

  public async recoverNodeId() {
    try {
      const pathToFile = path.join(
        this.homeDir,
        DefaultDumpingPaths.BLOCKCHAIN_DATA_PATH_DIR,
        DefaultDumpingPaths.NODE_ID_FILE
      );

      const data = JSON.parse(
        await fs.readFile(pathToFile, { encoding: "utf-8" })
      );

      return data;
    } catch {
      return undefined;
    }
  }
}

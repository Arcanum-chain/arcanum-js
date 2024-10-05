import { exec } from "node:child_process";
import os from "node:os";

import { Logger } from "../../logger";

export class FsSecurity {
  private readonly logger = new Logger();

  public safetyFs() {
    try {
      const platform = os.platform();

      if (platform === "linux") {
        this.addCommonDirToSudoGroup();
      } else {
        this.logger.warn(
          `Not safety fs, you platform ${platform}, expect linux`
        );
      }
    } catch (e) {
      throw e;
    }
  }

  private addCommonDirToSudoGroup() {
    try {
      this.createRavkchainGroup();

      exec(
        "chown root:ravkchain-group ~/.arcanum && chmod 750 ~/.arcanum",
        (err, stdout, stderr) => {
          if (err) {
            console.log(err);
            this.logger.panicError(
              "FS_SAFETY error in chown root mode to /.arcanum dir"
            );
            return;
          }

          if (stderr) {
            this.logger.panicError(
              "FS_SAFETY error in chown root mode to /.arcanum dir"
            );
            return;
          }

          this.logger.info(`FS_SAFETY successful chown dir to sudo group`);
        }
      );
    } catch (e) {
      throw new Error(`FS_SAFETY error!\nDetails: ${(e as Error).message}`);
    }
  }

  private createRavkchainGroup() {
    try {
      exec("sudo groupadd ravkchain-group", (err, stdout, stderr) => {
        if (err) {
          console.log(err);
          this.logger.panicError(
            "FS_SAFETY error in not create group ravkchain-group"
          );
          return;
        }

        if (stderr) {
          this.logger.panicError(
            "FS_SAFETY error in not create group ravkchain-group"
          );
          return;
        }

        this.logger.info(`FS_SAFETY successful create group`);
      });
    } catch (e) {
      throw e;
    }
  }
}

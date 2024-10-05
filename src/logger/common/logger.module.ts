import path from "node:path";
import os from "node:os";
import fs from "node:fs";

import colors from "colors";

import { LoggerLevels, ColorsConsole } from "../index";
import { DEFAULT_DIR, LOGGER_FILE } from "../../constants";

import type { LoggerOptions } from "./dto/logger-options.dto";

export class Logger {
  private readonly logFile = path.resolve(
    os.homedir(),
    DEFAULT_DIR,
    LOGGER_FILE
  );
  private readonly serviceName: string;

  constructor(serviceName?: string) {
    this.serviceName = serviceName ?? "APP";

    colors.setTheme({
      info: "green",
      warn: "yellow",
      error: "red",
      debug: "blue",
    });
  }

  private log({ level, message }: LoggerOptions) {
    try {
      const timestamp = new Date().toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      });
      const logEntry =
        `[LOGGER]: ${this.serviceName} ${timestamp} [${level}] ${message}\n`[
          // @ts-ignore
          ColorsConsole[level]
        ];

      fs.appendFile(this.logFile, logEntry, (err) => {
        if (err) {
          throw err;
        }
      });

      // @ts-ignore
      console[ColorsConsole[level]](logEntry.trim());
    } catch (e) {
      console.log(
        `[NODE_LOGGER]: Logger error!\n Details: ${(e as Error).message}`
      );
    }
  }

  public info(msg: string) {
    try {
      this.log({ level: LoggerLevels.INFO, message: msg });
    } catch (e) {
      throw e;
    }
  }

  public error(msg: string) {
    try {
      return this.log({ message: msg, level: LoggerLevels.ERROR });
    } catch (e) {
      throw e;
    }
  }

  public debug(msg: string) {
    try {
      return this.log({ level: LoggerLevels.DEBUG, message: msg });
    } catch (e) {
      throw e;
    }
  }

  public panicError(msg: string) {
    try {
      return this.log({ message: msg, level: LoggerLevels.PANIC_ERROR });
    } catch (e) {
      throw e;
    }
  }

  public warn(msg: string) {
    try {
      return this.log({ level: LoggerLevels.WARN, message: msg });
    } catch (e) {
      throw e;
    }
  }
}

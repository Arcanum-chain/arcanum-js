import { LoggerLevels } from "../../index";

export interface LoggerOptions {
  readonly level: LoggerLevels;
  readonly message: string;
}

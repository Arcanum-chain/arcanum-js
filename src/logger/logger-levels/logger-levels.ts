export enum LoggerLevels {
  INFO = "INFO",
  ERROR = "ERROR",
  WARN = "WARN",
  DEBUG = "DEBUG",
  PANIC_ERROR = "PANIC_ERROR",
}

export const ColorsConsole = {
  [LoggerLevels.INFO]: "info",
  [LoggerLevels.ERROR]: "error",
  [LoggerLevels.DEBUG]: "debug",
  [LoggerLevels.WARN]: "warn",
  [LoggerLevels.PANIC_ERROR]: "error",
};

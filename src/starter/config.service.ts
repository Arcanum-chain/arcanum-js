import { config } from "dotenv";
import yaml from "js-yaml";
import fs from "fs";
import os from "node:os";
import path from "node:path";

import { EnvConfigModelKeys, EnvProto, KeyEnvsObj } from "./models/env.models";
import { DEFAULT_HASH_PREFIX, DEFAULT_DIR } from "../constants";

config();

export class ConfigService {
  public env!: KeyEnvsObj;

  constructor() {
    this.parseEnv();
  }

  private parseEnv() {
    try {
      const filePath = path.resolve(os.homedir(), DEFAULT_DIR, "config.yml");
      const fileContent = fs.readFileSync(filePath, "utf8");

      const config = yaml.load(fileContent);

      if (typeof config !== "object" || config == null) {
        throw new Error(
          "Ошибка: Неверный формат YAML-файла. Ожидается объект."
        );
      }

      const parseEnvs = {};

      this.saveEnvs(config, parseEnvs);

      const parsedEnvs = this.validatePayloadObj(parseEnvs);

      this.env = parsedEnvs as unknown as KeyEnvsObj;
    } catch (e) {
      throw e;
    }
  }

  private validatePayloadObj(
    obj: Record<string, number | string | boolean | undefined>
  ) {
    try {
      const entries = Object.entries(EnvConfigModelKeys);

      for (const [key, value] of entries) {
        const env = obj[key];

        if (value.required && !env) {
          throw new Error(`[STARTER::ENV]: Environment ${key} is required!`);
        }

        let parseEnvValue;

        if (value.type === "number") {
          parseEnvValue = Number(env);

          if (isNaN(parseEnvValue)) {
            throw new Error(
              `[STARTER::ENV]: Env ${key} Expect ${value.type}, receiver ${parseEnvValue}`
            );
          }
        }

        if (value.type === "boolean") {
          parseEnvValue = JSON.parse(env as string);

          if (parseEnvValue !== true && parseEnvValue !== false) {
            throw new Error(
              `[STARTER::ENV]: Env ${key} Expect ${value.type}, receiver ${parseEnvValue}`
            );
          }
        }

        if (parseEnvValue === undefined && typeof env === "string") {
          this.checkValidationRules<string>(value, env as string);
        }

        obj[key] = parseEnvValue ?? env;

        continue;
      }

      return obj;
    } catch (e) {
      throw e;
    }
  }

  private checkValidationRules<T>(expectProto: EnvProto, value: T) {
    try {
      if (!expectProto.validationRules) {
        return;
      }

      if (expectProto.validationRules.isUserAddress) {
        if (!(value as string).startsWith(DEFAULT_HASH_PREFIX)) {
          throw new Error(
            `[STARTER::ENV]: Validation rule isUserAddress returned error, expect address, received ${value}\nDetails: ${value} not started "${DEFAULT_HASH_PREFIX}" prefix`
          );
        }
      }

      return;
    } catch (e) {
      throw e;
    }
  }

  private saveEnvs(config: object, obj: Record<string, any>) {
    try {
      Object.entries(config).map(([key, value]) => {
        if (typeof value === "object") {
          return this.saveEnvs(value, obj);
        } else {
          obj[key] = value;
        }
      });
    } catch (e) {
      throw e;
    }
  }
}

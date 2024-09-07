import { config } from "dotenv";

import { EnvConfigModelKeys, KeyEnvsObj } from "./models/env.models";

config();

export class ConfigService {
  public env!: KeyEnvsObj;

  constructor() {
    this.parseEnv();
  }

  private parseEnv() {
    try {
      const envs = process.env;

      const payloadObj: Record<string, number | string | boolean | undefined> =
        {};

      const entries = Object.entries(envs);

      const expectedKeysArr = Object.keys(EnvConfigModelKeys);

      for (const [key, value] of entries) {
        if (expectedKeysArr.includes(key)) {
          payloadObj[key] = value;
        }
      }

      const parsedEnvs = this.validatePayloadObj(payloadObj);

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

        obj[key] = parseEnvValue ?? env;

        continue;
      }

      return obj;
    } catch (e) {
      throw e;
    }
  }
}

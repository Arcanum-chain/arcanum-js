import crypto from "node:crypto";

import { CLASSIC_IV, DEFAULT_HASH_PREFIX } from "../constants";

import { ConvertToLaService } from "../utils/convert.la.service.util";
import { EncodeUtilService } from "../utils/encode.service.util";

import type { User } from "../user/user.interface";

export class BlockChainUser {
  private readonly encodeService: EncodeUtilService;
  private readonly convertLaService: ConvertToLaService;

  constructor(private users: Record<User["publicKey"], User>) {
    this.encodeService = new EncodeUtilService();
    this.convertLaService = new ConvertToLaService();

    if (this) {
      return this;
    }
  }

  public createNewUser(): {
    user: User;
    secrets: { privateKey: string; sedCode: string };
  } {
    try {
      const { privateKey, publicKey } = this.generatePublicAndPrivateKey();

      const isOk = this.checkIsEmptyAddress(publicKey);
      const sedCode = this.generateSedCode(privateKey);
      const data = this.encryptUserSecretData(publicKey, {
        privateKey,
        sedCode,
      });

      if (isOk) {
        const newUser: User = {
          publicKey,
          balance: "100",
          data: data,
        };

        const secrets = {
          privateKey,
          sedCode,
        };

        return { user: newUser, secrets };
      } else {
        throw new Error("Ошибка при создании пользователя");
      }
    } catch (e) {
      throw e;
    }
  }

  public generateSedCode(privateKey: string) {
    try {
      const randomCode = crypto.randomBytes(50).toString("hex");

      const hash = crypto
        .createHash("md5")
        .update(`${randomCode}${privateKey}`)
        .digest("hex");

      const randomSubstringValStart = Math.ceil(Math.random() * 20);
      const randomSubstringValEnd = Math.ceil(Math.random() * 20);

      const sedCode = hash.substring(
        randomSubstringValStart,
        randomSubstringValEnd
      );

      if (sedCode.length <= 15) {
        return hash.substring(1, 10);
      }

      return sedCode;
    } catch (e) {
      throw e;
    }
  }

  private checkIsEmptyAddress(publicKey: string): boolean {
    try {
      const user = this.users[publicKey];

      if (user) {
        throw new Error("Такой юзер уже существует");
      }

      return true;
    } catch (e) {
      throw e;
    }
  }

  private generatePublicAndPrivateKey() {
    try {
      let dirtyPublicKey: string = "";
      let dirtyPrivateKey: string = "";

      crypto.generateKeyPair(
        "rsa",
        {
          modulusLength: 2048,
          publicKeyEncoding: {
            type: "spki",
            format: "pem",
          },
          privateKeyEncoding: {
            type: "pkcs8",
            format: "pem",
          },
        },
        (err, pubKey, privKey) => {
          if (err && err instanceof Error) {
            throw err;
          }

          dirtyPrivateKey = privKey;
          dirtyPublicKey = pubKey;
        }
      );

      const dataPrivateKeyToHash = JSON.stringify({
        date: Date.now(),
        key: dirtyPrivateKey,
      });

      const dataPublicKeyToHash = JSON.stringify({
        date: Date.now() + Math.random(),
        key: dirtyPublicKey,
      });

      const newHashingPrivateKey = crypto
        .createHash("sha-256")
        .update(dataPrivateKeyToHash)
        .digest("hex");
      const newHashingPublicKey = crypto
        .createHash("sha-256")
        .update(dataPublicKeyToHash)
        .digest("hex");

      const keys = {
        publicKey: `${DEFAULT_HASH_PREFIX}${newHashingPublicKey}`,
        privateKey: `${DEFAULT_HASH_PREFIX}${newHashingPrivateKey}`,
      };

      dirtyPrivateKey = "";
      dirtyPublicKey = "";

      return keys;
    } catch (e) {
      throw e;
    }
  }

  public getUserBalance(address: string) {
    try {
      const user = this.users[address];

      if (!user) {
        throw new Error("Not found user");
      }

      return +this.convertLaService.toRei(user.balance.toString());
    } catch (e) {
      throw e;
    }
  }

  private encryptUserSecretData(
    publicKey: string,
    data: { privateKey: string; sedCode: string }
  ) {
    try {
      const stepOneEncodeVal = this.encodeService.encodeUserSecret(data);

      const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        Buffer.from(publicKey.substring(4), "hex"),
        CLASSIC_IV
      );

      cipher.setEncoding("hex");

      const encrypt = cipher.update(stepOneEncodeVal);

      const encrypted = Buffer.concat([encrypt, cipher.final()]);

      return `${DEFAULT_HASH_PREFIX}${encrypted.toString("hex")}`;
    } catch (e) {
      throw e;
    }
  }

  public getSecretUserData(publicKey: string, sedCode: string) {
    try {
      const userData = this.users[publicKey];

      if (!userData) {
        throw new Error("User not found");
      }

      return this.decodeUserData(
        publicKey,
        userData.data.substring(5),
        sedCode
      );
    } catch (e) {
      throw e;
    }
  }

  private decodeUserData(publicKey: string, data: string, sedCode: string) {
    try {
      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        Buffer.from(publicKey.substring(4), "hex"),
        CLASSIC_IV
      );

      const blockSize = 16; // Размер блока AES
      const decryptedParts = [];

      for (let i = 0; i < data.length; i += blockSize) {
        const block = data.substring(i, i + blockSize);
        const decryptedPart = decipher.update(block, "hex", "utf-8");
        decryptedParts.push(decryptedPart);
      }

      const finalDecrypted = decipher.final("utf-8");
      decryptedParts.push(finalDecrypted);

      const decryptedDataDirty = decryptedParts.join("");
      const value = this.encodeService.decodeUserSecret(
        decryptedDataDirty,
        sedCode
      );

      return value;
    } catch (e) {
      throw e;
    }
  }
}

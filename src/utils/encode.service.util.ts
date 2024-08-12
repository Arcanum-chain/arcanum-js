import crypto from "node:crypto";

import {
  CLASSIC_IV_TRANSACTION,
  DEFAULT_HASH_PREFIX,
} from "../constants/default.hash.prefix";

import type { TransactionDecoded } from "../transaction/transaction.interface";
import type { EncodeSecretUserDto } from "./dto/encode-secret-user.dto";
import type { EncodeTransactionDataDto } from "./dto/encode-transaction-data.dto";

export class EncodeUtilService {
  public encodeUserSecret(dto: EncodeSecretUserDto) {
    try {
      const data: string = JSON.stringify({
        privateKey: dto.privateKey.substring(5).split("").reverse().join(""),
        sedCode: dto.sedCode.split("").reverse().join(""),
      });

      const encodeVal: string = btoa(data);
      const encodeValueString = [...new TextEncoder().encode(encodeVal)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      return encodeValueString;
    } catch (e) {
      throw e;
    }
  }

  public decodeUserSecret(encodeValueString: string, sedCode: string) {
    try {
      //   @ts-expect-error
      const decodedString = encodeValueString
        .match(/.{1,2}/g)
        .map((e) => String.fromCharCode(parseInt(e, 16)))
        .join("");

      const decodedValue = atob(decodedString).toString();

      const normalizeData: { privateKey: string; sedCode: string } =
        JSON.parse(decodedValue);

      const userSecretData = {
        privateKey: `${DEFAULT_HASH_PREFIX}${normalizeData.privateKey
          .split("")
          .reverse()
          .join("")}`,
        sedCode: normalizeData.sedCode.split("").reverse().join(""),
      };

      if (userSecretData.sedCode !== sedCode) {
        throw new Error("Permission denied");
      }

      return userSecretData;
    } catch (e) {
      throw e;
    }
  }

  public encodeTransactionData(dto: EncodeTransactionDataDto) {
    try {
      const data: string = JSON.stringify({
        ...dto,
        to: dto.to.split("").reverse().join(""),
        sender: dto.sender.split("").reverse().join(""),
      } as EncodeTransactionDataDto);

      const encodeVal: string = btoa(data);
      const encodeValueString = [...new TextEncoder().encode(encodeVal)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        Buffer.from(dto.blockHash.substring(DEFAULT_HASH_PREFIX.length), "hex"),
        CLASSIC_IV_TRANSACTION
      );

      cipher.setEncoding("hex");

      const encrypt = cipher.update(encodeValueString);

      const encrypted = Buffer.concat([encrypt, cipher.final()]);

      return `${DEFAULT_HASH_PREFIX}${encrypted.toString("hex")}`;
    } catch (e) {
      throw e;
    }
  }

  public decodeTransactionData(encodeValueString: string, blockHash: string) {
    try {
      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        Buffer.from(blockHash.substring(DEFAULT_HASH_PREFIX.length), "hex"),
        CLASSIC_IV_TRANSACTION
      );

      const blockSize = 16; // Размер блока AES
      const decryptedParts = [];

      for (let i = 0; i < encodeValueString.length; i += blockSize) {
        const block = encodeValueString.substring(i, i + blockSize);
        const decryptedPart = decipher.update(block, "hex", "utf-8");
        decryptedParts.push(decryptedPart);
      }

      const finalDecrypted = decipher.final("utf-8");
      decryptedParts.push(finalDecrypted);

      const decryptedDataDirty = decryptedParts.join("");

      //   @ts-expect-error
      const decodedString = decryptedDataDirty
        .match(/.{1,2}/g)
        .map((e) => String.fromCharCode(parseInt(e, 16)))
        .join("");

      const decodedValue = atob(decodedString).toString();

      const normalizeData: TransactionDecoded["data"] =
        JSON.parse(decodedValue);

      const decodeData: TransactionDecoded["data"] = {
        ...normalizeData,
        sender: `${normalizeData.sender.split("").reverse().join("")}`,
        to: normalizeData.to.split("").reverse().join(""),
      };

      if (decodeData.blockHash !== blockHash) {
        throw new Error("Permission denied");
      }

      return decodeData;
    } catch (e) {
      throw e;
    }
  }
}

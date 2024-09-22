import { DEFAULT_HASH_PREFIX } from "../constants/default.hash.prefix";

import type { TransactionDecoded } from "../blockchain-common";
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
}

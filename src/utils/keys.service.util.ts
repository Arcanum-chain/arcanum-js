import crypto from "node:crypto";
import { promisify } from "node:util";

import { BlockChainError, BlockChainErrorCodes } from "../errors";

export class KeyService {
  public addHeadersToKey(key: string, keyType: "PRIVATE" | "PUBLIC") {
    try {
      if (!key) {
        throw new BlockChainError(BlockChainErrorCodes.INVALID_USER_KEY);
      }

      return `-----BEGIN ${keyType} KEY-----
            ${key}
            -----END ${keyType} KEY-----`;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.INVALID_USER_KEY);
    }
  }

  public async generateKeyPair() {
    const generateKeyPairAsync = promisify(crypto.generateKeyPair);

    const { publicKey, privateKey } = await generateKeyPairAsync("ec", {
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
      namedCurve: "secp256k1",
    });

    // Удаление BEGIN/END строк из ключей
    const privateKeyWithoutHeaders = privateKey.replace(
      /-----BEGIN PRIVATE KEY-----|\n-----END PRIVATE KEY-----/g,
      ""
    );
    const publicKeyWithoutHeaders = publicKey.replace(
      /-----BEGIN PUBLIC KEY-----|\n-----END PUBLIC KEY-----/g,
      ""
    );

    const privateKeyBase64 = privateKeyWithoutHeaders.replace(/\n/g, "");
    const publicKeyBase64 = publicKeyWithoutHeaders.replace(/\n/g, "");

    return { publicKey: publicKeyBase64, privateKey: privateKeyBase64 };
  }
}

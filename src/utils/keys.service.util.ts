import bs58 from "bs58";
import { keccak256 } from "js-sha3";
import crypto from "node:crypto";
import { promisify } from "node:util";

import { DEFAULT_HASH_PREFIX } from "../constants";
import { BlockChainError, BlockChainErrorCodes } from "../errors";

export class KeyService {
  public addHeadersToKey(key: string, keyType: "PRIVATE" | "PUBLIC") {
    if (!key) {
      throw new BlockChainError(BlockChainErrorCodes.INVALID_USER_KEY);
    }

    const data = `-----BEGIN ${keyType} KEY-----
${key}
-----END ${keyType} KEY-----`;

    return data;
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

  public async generateUserAddress(publicKey: string) {
    try {
      const hash = keccak256(publicKey);
      const addressBytes = hash.slice(-20);

      const confirmationCode = new Buffer(
        keccak256(keccak256(addressBytes)).slice(0, 4)
      );

      const fullAddress = Buffer.concat([
        new Buffer(addressBytes),
        confirmationCode,
      ]);

      const encodedAddress = bs58.encode(fullAddress);

      const networkAddress = `${DEFAULT_HASH_PREFIX}${encodedAddress}`;

      return networkAddress;
    } catch (e) {
      throw e;
    }
  }
}

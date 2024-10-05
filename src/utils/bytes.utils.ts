import crypto from "crypto";

const BIGINT_0 = BigInt(0);

const BIGINT_CACHE: bigint[] = [];
for (let i = 0; i <= 256 * 256 - 1; i++) {
  BIGINT_CACHE[i] = BigInt(i);
}

export function equalsBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export const bytesToUnPrefixedHex = (bytes: Uint8Array) => {
  return Buffer.from(bytes).toString("hex");
};

export const bytesToHex = (bytes: Uint8Array) => {
  if (bytes === undefined || bytes.length === 0) return "0x";
  const unprefixedHex = bytesToUnPrefixedHex(bytes);
  return "0x" + unprefixedHex;
};

export const bytesToBigInt = (
  bytes: Uint8Array,
  littleEndian = false
): bigint => {
  if (littleEndian) {
    bytes.reverse();
  }
  const hex = bytesToHex(bytes);
  if (hex === "0x") {
    return BIGINT_0;
  }
  if (hex.length === 4) {
    return BIGINT_CACHE[bytes[0]];
  }
  if (hex.length === 6) {
    return BIGINT_CACHE[bytes[0] * 256 + bytes[1]];
  }
  return BigInt(hex);
};

export const bytesToInt = (bytes: Uint8Array): number => {
  const res = Number(bytesToBigInt(bytes));
  if (!Number.isSafeInteger(res)) throw new Error("Number exceeds 53 bits");
  return res;
};

export const randomBytes = (length: number) => {
  return crypto.randomBytes(length);
};

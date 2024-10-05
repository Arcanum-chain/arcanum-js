import { concatBytes } from "../../utils";

const ceil = (value: number, ceiling: number): number => {
  const r = value % ceiling;
  if (r === 0) {
    return value;
  } else {
    return value + ceiling - r;
  }
};

const CONTAINER_SIZE = 8192;

export class Memory {
  _store: Uint8Array;

  constructor() {
    this._store = new Uint8Array(CONTAINER_SIZE);
  }

  public extend(offset: number, size: number) {
    if (size === 0) {
      return;
    }

    const newSize = ceil(offset + size, 32);
    const sizeDiff = newSize - this._store.length;
    if (sizeDiff > 0) {
      const expandBy = Math.ceil(sizeDiff / CONTAINER_SIZE) * CONTAINER_SIZE;
      this._store = concatBytes(this._store, new Uint8Array(expandBy));
    }
  }

  public write(offset: number, size: number, value: Uint8Array) {
    if (size === 0) {
      return;
    }

    this.extend(offset, size);

    if (value.length !== size) throw new Error("Invalid value size");
    if (offset + size > this._store.length)
      throw new Error("Value exceeds memory capacity");

    this._store.set(value, offset);
  }

  public read(offset: number, size: number, avoidCopy?: boolean): Uint8Array {
    this.extend(offset, size);

    const loaded = this._store.subarray(offset, offset + size);
    if (avoidCopy === true) {
      return loaded;
    }
    const returnBytes = new Uint8Array(size);
    returnBytes.set(loaded);

    return returnBytes;
  }
}

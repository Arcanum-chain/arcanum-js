import { ERROR, AvmError } from "../index";

export class Stack {
  private _store: bigint[];
  private _maxHeight: number;

  private _len: number = 0;

  constructor(maxHeight?: number) {
    this._store = [];
    this._maxHeight = maxHeight ?? 1024;
  }

  public get length() {
    return this._len;
  }

  public push(value: bigint) {
    if (this._len >= this._maxHeight) {
      throw new AvmError(ERROR.STACK_OVERFLOW);
    }

    this._store[this._len++] = value;
  }

  public pop(): bigint {
    if (this._len < 1) {
      throw new AvmError(ERROR.STACK_UNDERFLOW);
    }

    return this._store[--this._len];
  }

  public popN(num: number = 1): bigint[] {
    if (this._len < num) {
      throw new AvmError(ERROR.STACK_UNDERFLOW);
    }

    if (num === 0) {
      return [];
    }

    const arr = Array(num);
    const cache = this._store;

    for (let pop = 0; pop < num; pop++) {
      arr[pop] = cache[--this._len];
    }

    return arr;
  }

  public peek(num: number = 1): bigint[] {
    const peekArray: bigint[] = Array(num);
    let start = this._len;

    for (let peek = 0; peek < num; peek++) {
      const index = --start;
      if (index < 0) {
        throw new AvmError(ERROR.STACK_UNDERFLOW);
      }
      peekArray[peek] = this._store[index];
    }
    return peekArray;
  }

  public swap(position: number) {
    if (this._len <= position) {
      throw new AvmError(ERROR.STACK_UNDERFLOW);
    }

    const head = this._len - 1;
    const i = head - position;
    const storageCached = this._store;

    const tmp = storageCached[head];
    storageCached[head] = storageCached[i];
    storageCached[i] = tmp;
  }

  public dup(position: number) {
    const len = this._len;
    if (len < position) {
      throw new AvmError(ERROR.STACK_UNDERFLOW);
    }

    if (len >= this._maxHeight) {
      throw new AvmError(ERROR.STACK_OVERFLOW);
    }

    const i = len - position;
    this._store[this._len++] = this._store[i];
  }

  public exchange(swap1: number, swap2: number) {
    const headIndex = this._len - 1;
    const exchangeIndex1 = headIndex - swap1;
    const exchangeIndex2 = headIndex - swap2;

    if (exchangeIndex1 < 0 || exchangeIndex2 < 0) {
      throw new AvmError(ERROR.STACK_UNDERFLOW);
    }

    const cache = this._store[exchangeIndex2];
    this._store[exchangeIndex2] = this._store[exchangeIndex1];
    this._store[exchangeIndex1] = cache;
  }

  public getStack() {
    return this._store.slice(0, this._len);
  }
}

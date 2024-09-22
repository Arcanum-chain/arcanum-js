export class Memory {
  private readonly store: Uint32Array;

  constructor() {
    this.store = new Uint32Array();
  }

  public get getStore() {
    return this.store;
  }
}

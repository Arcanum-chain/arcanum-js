export class Singleton {
  private static instance: Singleton | null = null;

  protected constructor() {}

  public static getInstance<T extends Singleton>(this: new () => T): T {
    if (!Singleton.instance) {
      Singleton.instance = new this();
    }
    return Singleton.instance as T;
  }
}

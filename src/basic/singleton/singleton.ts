export class Singleton {
  private static instance: Map<any, Singleton | null> = new Map();

  protected constructor() {}

  public static getInstance<T extends Singleton>(this: new () => T): T {
    // @ts-expect-error
    if (!Singleton.instance[this.name as string]) {
      // @ts-expect-error
      Singleton.instance[this.name] = new this();
    }
    // @ts-expect-error
    return Singleton.instance[this.name] as T;
  }
}

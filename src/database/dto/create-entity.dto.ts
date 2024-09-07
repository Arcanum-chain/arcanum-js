export interface CreateEntityDto<T> {
  readonly key: string;
  readonly data: T;
}

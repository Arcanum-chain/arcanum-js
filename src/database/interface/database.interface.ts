import type { CreateEntityDto } from "../dto/create-entity.dto";

export interface KeyValue<T> {
  key: any | string;
  value: T;
}

export interface DatabaseInterface<Entity> {
  create: <T>(dto: CreateEntityDto<T>) => Promise<"Ok">;

  findOne: (key: string) => Promise<Entity>;

  findMany: () => Promise<Entity[]>;

  clearAllDatabase: () => Promise<void>;
}

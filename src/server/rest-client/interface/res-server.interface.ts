export enum Status {
  OK = "Ok",
  FAIL = "Fail",
}

export interface RestServerResponse<T> {
  readonly status: Status;
  readonly data?: T;
  readonly message?: string;
  readonly timestamp: number;
}

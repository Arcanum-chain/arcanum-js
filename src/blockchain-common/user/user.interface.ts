export interface User {
  readonly publicKey: string;
  balance: string;
  readonly address: string;
}

export interface ReturnCreateUserDto {
  readonly user: User;
  readonly privateKey: string;
}

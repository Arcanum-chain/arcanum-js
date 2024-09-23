export interface VerifySignatureDto {
  readonly data: {
    readonly nodeId: string;
    readonly timestamp: number;
  };
  readonly signature: string;
  readonly publicKey: string;
}

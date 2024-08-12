export declare class VerifyBlockService {
    isHashProofed({ hash, difficulty, prefix, }: {
        hash: string;
        difficulty?: number;
        prefix?: string;
    }): boolean;
    isHashValid(hash: string): boolean;
    genHash(data: string): string;
}
//# sourceMappingURL=verify.block.util.service.d.ts.map
import type { User } from "../user/user.interface";
export declare class BlockChainUser {
    private users;
    private readonly encodeService;
    private readonly convertLaService;
    constructor(users: Record<User["publicKey"], User>);
    createNewUser(): {
        user: User;
        secrets: {
            privateKey: string;
            sedCode: string;
        };
    };
    generateSedCode(privateKey: string): string;
    private checkIsEmptyAddress;
    private generatePublicAndPrivateKey;
    getUserBalance(address: string): number;
    private encryptUserSecretData;
    getSecretUserData(publicKey: string, sedCode: string): {
        privateKey: string;
        sedCode: string;
    };
    private decodeUserData;
}
//# sourceMappingURL=user.d.ts.map
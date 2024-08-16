import type { ReturnCreateUserDto, User } from "../user/user.interface";
export declare class BlockChainUser {
    private users;
    private readonly convertLaService;
    private readonly keyService;
    private readonly store;
    constructor(users: Record<User["publicKey"], User>);
    createNewUser(): Promise<ReturnCreateUserDto>;
    private checkIsEmptyAddress;
    private generatePublicAndPrivateKey;
    getUserBalance(address: string): number;
}
//# sourceMappingURL=user.d.ts.map
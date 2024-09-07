import { BlockChainStore } from "../store";

import { BlockChainError, BlockChainErrorCodes } from "../errors";
import { ConvertToLaService } from "../utils/convert.la.service.util";
import { KeyService } from "../utils/keys.service.util";

import type { ReturnCreateUserDto, User } from "../user/user.interface";

export class BlockChainUser {
  private readonly convertLaService: ConvertToLaService;
  private readonly keyService: KeyService;
  private readonly store: typeof BlockChainStore = BlockChainStore;

  constructor(private users: Record<User["publicKey"], User>) {
    this.convertLaService = new ConvertToLaService();
    this.keyService = new KeyService();

    if (this) {
      return this;
    }
  }

  public async createNewUser(): Promise<ReturnCreateUserDto> {
    try {
      const { privateKey, publicKey } =
        await this.generatePublicAndPrivateKey();
      const userAddress = await this.keyService.generateUserAddress(publicKey);

      const isOk = this.checkIsEmptyAddress(userAddress);

      if (isOk) {
        const newUser: User = {
          publicKey,
          balance: JSON.parse(process.env.IS_THE_TEST_NODE as string)
            ? "100"
            : "0",
          address: userAddress,
        };

        this.store.setNewUser(newUser);

        return { user: newUser, privateKey };
      } else {
        throw new Error("Ошибка при создании пользователя");
      }
    } catch (e) {
      throw e;
    }
  }

  private checkIsEmptyAddress(address: string): boolean {
    try {
      const userByAddress = this.store.getOriginalUserObject()[address];

      if (userByAddress) {
        throw new BlockChainError(BlockChainErrorCodes.DUPLICATE_DATA);
      }

      return true;
    } catch (e) {
      throw e;
    }
  }

  private async generatePublicAndPrivateKey() {
    try {
      return this.keyService.generateKeyPair();
    } catch (e) {
      throw e;
    }
  }

  public getUserBalance(address: string) {
    try {
      const user = this.users[address];

      if (!user) {
        throw new Error("Not found user");
      }

      return +this.convertLaService.toRei(user.balance.toString());
    } catch (e) {
      throw e;
    }
  }
}

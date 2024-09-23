import { BlockChainStore } from "../../store";

import { BlockChainError, BlockChainErrorCodes } from "../../errors";
import { ConvertToLaService, KeyService } from "../../utils";

import type { ReturnCreateUserDto, User } from "../user/user.interface";

export class BlockChainUser {
  private readonly convertLaService: ConvertToLaService;
  private readonly keyService: KeyService;
  private readonly store: typeof BlockChainStore = BlockChainStore;

  constructor() {
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
          balance: "100",
          address: userAddress,
        };

        await this.store.setNewUser(newUser);

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

  public async getUserByAddress(address: string) {
    try {
      const user = await this.store.getUserByAddress(address);

      if (!user) {
        throw new Error("Not found user");
      }

      return user;
    } catch (e) {
      throw e;
    }
  }
}

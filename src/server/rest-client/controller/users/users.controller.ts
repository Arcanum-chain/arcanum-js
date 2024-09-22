import type { Request } from "express";

import { ErrorHandling } from "../../errors";

import { UserService } from "../../service";

export class RestUsersController {
  @ErrorHandling()
  public async getUsers() {
    const data = await new UserService().getUsers();

    return data;
  }

  @ErrorHandling()
  public async createUser() {
    const data = await new UserService().createUser();

    return data;
  }

  @ErrorHandling()
  public async getUserByAddress(req: Request) {
    const address = req.params.adr;
    const data = await new UserService().getUserByAddress(address);

    return data;
  }
}

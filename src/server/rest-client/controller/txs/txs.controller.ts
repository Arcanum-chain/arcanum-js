import { Request } from "express";

import { TxService } from "../../service";

import { ErrorHandling } from "../../errors";

import { CreateTxDto } from "../../dto";

export class RestTxsController {
  @ErrorHandling()
  public async createTx(req: Request) {
    const body = CreateTxDto.parse(req.body);

    const data = await new TxService().createTx(body);

    return data;
  }
}

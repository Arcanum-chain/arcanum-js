import { Request, Response } from "express";

import { ErrorHandling } from "../../errors";

import { BlockService } from "../../service";

export class RestBlocksController {
  @ErrorHandling()
  public async getAllBlocks() {
    const data = await new BlockService().getAllBlocks();

    return data;
  }

  @ErrorHandling()
  public async getLatestBlock() {
    const data = await new BlockService().getLatestBlock();

    return data;
  }

  @ErrorHandling()
  public async getBlockByHash(req: Request, res: Response) {
    const hash = req.params.hash;

    const data = await new BlockService().getBlockByHash(hash);

    return data;
  }
}

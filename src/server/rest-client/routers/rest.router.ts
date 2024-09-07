import { Router } from "express";

import { RestBlocksController, RestTxsController } from "../controller";

export class RestRouter {
  private readonly globalRouter = Router();

  public getRouter() {
    try {
      this.globalRouter.use("/block", this.blocksRouter());
      this.globalRouter.use("/txs", this.txRouter());

      return this.globalRouter;
    } catch (e) {
      throw e;
    }
  }

  private blocksRouter() {
    try {
      const router = Router();
      const controller = new RestBlocksController();

      router.get("/", controller.getAllBlocks);
      router.get("/latest", controller.getLatestBlock);
      router.get("/:hash", controller.getBlockByHash);

      return router;
    } catch (e) {
      throw e;
    }
  }

  private txRouter() {
    try {
      const router = Router();
      const controller = new RestTxsController();

      router.post("/", controller.createTx);

      return router;
    } catch (e) {
      throw e;
    }
  }
}

import { Router } from "express";

import {
  RestBlocksController,
  RestTxsController,
  RestUsersController,
} from "../controller";

export class RestRouter {
  private readonly globalRouter = Router();

  public getRouter() {
    try {
      this.globalRouter.use("/block", this.blocksRouter());
      this.globalRouter.use("/txs", this.txRouter());
      this.globalRouter.use("/users", this.userRouter());

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
      router.get("/mempool", controller.getAllInMempool);
      router.get("/mempool/:hash", controller.txByHashInMempool);

      return router;
    } catch (e) {
      throw e;
    }
  }

  private userRouter() {
    try {
      const router = Router();
      const controller = new RestUsersController();

      router.post("/", controller.createUser);
      router.get("/", controller.getUsers);
      router.get("/:adr", controller.getUserByAddress);

      return router;
    } catch (e) {
      throw e;
    }
  }
}

import cors from "cors";
import express from "express";

import { RestRouter } from "./routers/rest.router";

export class RestClient {
  private readonly router: RestRouter;
  private readonly port: number;

  constructor(port: number) {
    this.router = new RestRouter();
    this.port = port;
  }

  public async start() {
    try {
      const app = express();

      app.use(express.json());
      app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));

      app.use("/rest-api", this.router.getRouter());

      app.listen(this.port, () =>
        console.log(`[REST_CLIENT]: Listen to port ${this.port}`)
      );
    } catch (e) {
      throw new Error(`[REST_CLIENT::INITIAL]: Error: ${(e as Error).message}`);
    }
  }
}

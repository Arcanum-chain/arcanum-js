import cors from "cors";
import express from "express";
import type { IncomingMessage, Server, ServerResponse } from "http";

import { Logger } from "../../logger";

import { RestRouter } from "./routers/rest.router";

export class RestClient {
  private readonly router: RestRouter;
  private readonly port: number;
  private readonly logger = new Logger();
  private close?: Server<typeof IncomingMessage, typeof ServerResponse>;

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

      this.close = app.listen(this.port, () =>
        this.logger.info(`REST_CLIENT Listen to port ${this.port}`)
      );
    } catch (e) {
      throw new Error(`REST_CLIENT::INITIAL Error: ${(e as Error).message}`);
    }
  }

  public async closeServer() {
    try {
      this.close?.close((err) => {
        if (err) {
          this.logger.error(
            `REST_CLIENT Error in closing server\nDetails: ${err.message}`
          );
          return;
        }

        this.logger.info("REST_CLIENT Successful close server");
      });
    } catch (e) {
      throw e;
    }
  }
}

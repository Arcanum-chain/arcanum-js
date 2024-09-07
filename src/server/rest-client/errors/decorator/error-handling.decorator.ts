import type { Response } from "express";
import { ZodError } from "zod";

import { RestApiError } from "../";

import {
  RestServerResponse,
  Status,
} from "../../interface/res-server.interface";

interface Props {
  readonly showErrors?: boolean;
}

export function ErrorHandling(defaultString?: string, params?: Props) {
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      let res = args[1] as Response;
      try {
        const executionMethod = await originalMethod.apply(this, args);

        return res.status(200).send({
          status: Status.OK,
          data: executionMethod,
          timestamp: Date.now(),
        } as RestServerResponse<any>);
      } catch (err) {
        console.log(`Error handler | method: ${nameMethod} | ${err}`);
        if (params && params.showErrors) {
          console.log(err);
        }

        if (err instanceof ZodError) {
          return res.status(400).send({
            status: Status.FAIL,
            message: err.errors
              .map((err) => `${err.message} ${err.path[0]}`)
              .join(","),
            timestamp: Date.now(),
          } as RestServerResponse<any>);
        }

        if (err instanceof RestApiError) {
          return res.status(err.status).send({
            status: Status.FAIL,
            message: err.message,
            timestamp: Date.now(),
          } as RestServerResponse<any>);
        }

        const defaultError = new Error(
          defaultString ?? "Internal Server Error"
        );
        return res.status(500).send({
          status: Status.FAIL,
          message: defaultError.message,
          timestamp: Date.now(),
        } as RestServerResponse<any>);
      }
    };
  };
}

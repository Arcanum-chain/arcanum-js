import type { N2NRequest } from "./interfaces/req.interface";
import type { N2NResponse } from "./interfaces/res.interface";

export class SerializeProtocolData {
  public serialize(data: any): string {
    try {
      const dataToString = JSON.stringify(data);

      const encodeValueString = [...new TextEncoder().encode(dataToString)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      return encodeValueString;
    } catch (e) {
      throw e;
    }
  }

  public deserialize(data: string, type: "req" | "res") {
    try {
      const dataToString = Buffer.from(data, "hex").toString("utf-8");

      //   @ts-expect-error
      const decodedString = dataToString
        .match(/.{1,2}/g)
        .map((e) => String.fromCharCode(parseInt(e, 16)))
        .join("");

      if (type === "req") {
        return JSON.parse(decodedString) as N2NRequest;
      }

      return JSON.parse(decodedString) as N2NResponse;
    } catch (e) {
      throw e;
    }
  }
}

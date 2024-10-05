import rlp from "rlp";

import type { N2NRequest } from "./interfaces/req.interface";
import type { N2NResponse } from "./interfaces/res.interface";

export class SerializeProtocolData {
  public serialize(data: object): Uint8Array {
    try {
      return rlp.encode(JSON.stringify(data));
    } catch (e) {
      throw e;
    }
  }

  public deserialize(data: Uint8Array, type: "req" | "res") {
    try {
      const val = rlp.decode(data).toString();

      if (typeof JSON.parse(val) === "object") {
        return JSON.parse(val);
      }

      return val;
    } catch (e) {
      throw e;
    }
  }
}

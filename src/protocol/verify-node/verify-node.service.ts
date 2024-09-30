import crypto from "node:crypto";

import { NodeFilesService } from "../../starter/node-files/node-files.service";
import { Logger } from "../../logger";

import type { VerifySignatureDto } from "./dto/verify-signature.dto";

export class VerifyNode {
  private readonly nodeFilesService: NodeFilesService = new NodeFilesService();
  private readonly logger = new Logger();

  public async createSignature(nodeId: string, timestamp: number) {
    try {
      const data = JSON.stringify({ nodeId, timestamp });

      const privateKey = await this.nodeFilesService.getPrivateKey();

      const signer = crypto.createSign("sha256");
      signer.update(data);
      signer.end();

      const signature = signer.sign(privateKey, "base64");

      return signature.toString();
    } catch (e) {
      throw e;
    }
  }

  public async verifySignature(dto: VerifySignatureDto) {
    try {
      const data = JSON.stringify(dto.data);

      const verifier = crypto.createVerify("sha256");
      verifier.update(data);
      verifier.end();

      const isValid = verifier.verify(
        dto.publicKey,
        Buffer.from(dto.signature, "base64")
      );

      if (!isValid) {
        return false;
      } else {
        return true;
      }
    } catch (e) {
      this.logger.error(
        `NODE error verifying sender signature, sender node id ${
          dto.data.nodeId
        }\nDetails: ${(e as Error).message}`
      );
      return false;
    }
  }
}

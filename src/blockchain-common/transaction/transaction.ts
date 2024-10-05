import crypto from "node:crypto";

import {
  BASIC_CONVERT_VALUES_ENUM,
  DEFAULT_HASH_PREFIX,
} from "../../constants";

import { BlockChainError, BlockChainErrorCodes } from "../../errors";
import { BlockChainGas } from "../index";
import { BlockChainStore } from "../../store";
import { ConvertToLaService, EncodeUtilService, KeyService } from "../../utils";
import { TransactionActions } from "./transactionActions";

import type {
  BlockTransactionConstructor,
  Transaction,
} from "./transaction.interface";

export class BlockTransaction {
  public readonly sender: string;
  public readonly to: string;
  public readonly amount: number;
  public hash: string;
  public indexBlock: number;
  public blockHash: string;
  public readonly encodeService: EncodeUtilService;
  public readonly convertLaService: ConvertToLaService;
  public readonly gasService: BlockChainGas;
  public timestamp: number;
  private keyService: KeyService;
  public fee: number = 0;
  public readonly signature: string;
  private readonly store: typeof BlockChainStore = BlockChainStore;
  private readonly txActions: TransactionActions;

  constructor({
    sender,
    to,
    amount,
    indexBlock,
    blockHash,
    timestamp,
    signature,
  }: BlockTransactionConstructor) {
    this.sender = sender;
    this.to = to;
    this.amount = amount;
    this.indexBlock = indexBlock;
    this.blockHash = blockHash;
    this.encodeService = new EncodeUtilService();
    this.convertLaService = new ConvertToLaService();
    this.gasService = new BlockChainGas(0.5);
    this.timestamp = timestamp;
    this.keyService = new KeyService();
    this.signature = signature;
    this.hash = this.createTransactionHash();
    this.txActions = new TransactionActions();
    this.calculateFee();
  }

  private createTransactionHash(): string {
    const data = JSON.stringify({
      sender: this.sender,
      to: this.to,
      amount: this.amount,
      blockHash: this.blockHash,
      timestamp: this.timestamp,
      indexBlock: this.indexBlock,
      signature: this.signature,
    });

    const transactionHash = crypto
      .createHash("sha512")
      .update(crypto.createHash("sha512").update(data).digest())
      .digest();

    return `${DEFAULT_HASH_PREFIX}${transactionHash.toString("hex")}`;
  }

  public async createTransaction(): Promise<Transaction> {
    try {
      await this.validate();

      const payload: Transaction["data"] = {
        sender: this.sender,
        to: this.to,
        amount: this.amount,
        timestamp: this.timestamp,
      };

      const verifyData = JSON.stringify({
        sender: this.sender,
        to: this.to,
        amount: this.amount,
      });

      await this.verifySign(verifyData, this.signature, this.sender);

      return {
        data: payload,
        blockHash: this.blockHash,
        hash: this.hash,
        fee: this.fee,
      };
    } catch (e) {
      throw e;
    }
  }

  private calculateFee(): number {
    try {
      const fee = this.gasService.calculateGasPrice("rei");
      this.fee = fee;

      return fee;
    } catch (e) {
      throw e;
    }
  }

  public async verifySign(data: string, signature: string, address: string) {
    try {
      const { publicKey } = await this.store.getUserByAddress(address);

      const publicKeyWithHeaders = this.keyService.addHeadersToKey(
        publicKey,
        "PUBLIC"
      );

      const verifier = crypto.createVerify("sha256");
      verifier.update(data);
      verifier.end();

      const isValid = verifier.verify(
        publicKeyWithHeaders,
        Buffer.from(signature, "base64")
      );

      if (!isValid) {
        throw new BlockChainError(
          BlockChainErrorCodes.INVALID_VERIFY_TRANSACTION
        );
      } else {
        return true;
      }
    } catch (e) {
      throw e;
    }
  }

  private createCommission(senderBal: number) {
    try {
      const gas = this.gasService.calculateGasPrice(
        BASIC_CONVERT_VALUES_ENUM.LA
      );

      if (senderBal <= gas) {
        throw new Error("It is impossible to pay for gas transactions");
      }

      return { updatedSenderBal: senderBal - gas, gas: gas };
    } catch (e) {
      throw e;
    }
  }

  private async validate() {
    try {
      await this.txActions.checkTransferUsers(this.sender, this.to);

      const sender = await this.store.getUserByAddress(this.sender);

      const { updatedSenderBal, gas } = this.createCommission(
        +this.convertLaService.toLa(sender.balance)
      );
      const laAmount = +this.convertLaService.toLa(String(this.amount));

      this.fee = +this.convertLaService.toArc(String(gas));

      if (updatedSenderBal <= laAmount) {
        throw new BlockChainError(BlockChainErrorCodes.INSUFFICIENT_FUNDS);
      }
    } catch (e) {
      throw e;
    }
  }
}

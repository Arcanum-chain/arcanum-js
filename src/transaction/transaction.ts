import crypto from "node:crypto";

import { BASIC_CONVERT_VALUES_ENUM, DEFAULT_HASH_PREFIX } from "../constants";

import { BlockChainError, BlockChainErrorCodes } from "../errors";
import { BlockChainGas } from "../gas/gas";
import { BlockChainStore } from "../store";
import { ConvertToLaService } from "../utils/convert.la.service.util";
import { EncodeUtilService } from "../utils/encode.service.util";
import { KeyService } from "../utils/keys.service.util";

import type { User } from "../user/user.interface";
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
  public readonly users: Record<string, User> = {};
  public timestamp: number;
  private keyService: KeyService;
  public readonly signature: string;
  private readonly store: typeof BlockChainStore = BlockChainStore;

  constructor({
    sender,
    to,
    amount,
    indexBlock,
    blockHash,
    users,
    timestamp,
    signature,
  }: BlockTransactionConstructor) {
    this.sender = sender;
    this.to = to;
    this.amount = amount;
    this.hash = this.createTransactionHash();
    this.indexBlock = indexBlock;
    this.blockHash = blockHash;
    this.encodeService = new EncodeUtilService();
    this.convertLaService = new ConvertToLaService();
    this.gasService = new BlockChainGas(0.5);
    this.users = users;
    this.timestamp = timestamp;
    this.keyService = new KeyService();
    this.signature = signature;
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

    const key = `${this.sender}`;

    const transactionHash = crypto
      .createHash("sha256")
      .update(crypto.createHmac("sha256", key).update(data).digest())
      .digest();

    return `${DEFAULT_HASH_PREFIX}${transactionHash.toString("hex")}`;
  }

  public createTransaction(): Transaction {
    try {
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

      // this.verifySign(verifyData, this.signature, this.sender);

      return { data: payload, blockHash: this.blockHash, hash: this.hash };
    } catch (e) {
      throw e;
    }
  }

  public transfer(): boolean {
    try {
      const { sender, to } = this.checkTransferUsers(this.sender, this.to);

      const senderBal = +this.convertLaService.toLa(sender.balance);
      const laAmount = +this.convertLaService.toLa(this.amount.toString());
      const { updatedSenderBal, gas } = this.createCommission(senderBal);

      this.require(updatedSenderBal >= laAmount, "Insufficient funds");

      const newSenderBalance = this.convertLaService.toRei(
        String(
          +this.convertLaService.toLa(
            this.store.getUserByPublicKey(sender.publicKey).balance
          ) -
            (laAmount + gas)
        )
      );
      const newToBalance = this.convertLaService.toRei(
        String(
          +this.convertLaService.toLa(
            this.store.getUserByPublicKey(to.publicKey).balance
          ) + laAmount
        )
      );

      this.store.updateUserBalance(sender.publicKey, newSenderBalance);
      this.store.updateUserBalance(to.publicKey, newToBalance.toString());

      return true;
    } catch (e) {
      throw e;
    }
  }

  public checkTransferUsers(senderAdr: string, toAdr: string) {
    try {
      const sender = this.store.getUserByPublicKey(senderAdr);

      this.require(sender !== undefined, "Sender not found");

      const to = this.store.getUserByPublicKey(toAdr);

      this.require(to !== undefined, "Participient not found");

      return { sender, to };
    } catch (e) {
      throw e;
    }
  }

  public verifySign(data: string, signature: string, publicKey: string) {
    try {
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
    } catch {
      throw new BlockChainError(
        BlockChainErrorCodes.INVALID_VERIFY_TRANSACTION
      );
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

  private require(logic: boolean, msg: string) {
    try {
      if (logic) {
        return true;
      }

      throw new Error(msg);
    } catch (e) {
      throw e;
    }
  }
}

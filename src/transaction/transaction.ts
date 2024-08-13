import crypto from "node:crypto";

import { BASIC_CONVERT_VALUES_ENUM, DEFAULT_HASH_PREFIX } from "../constants";

import { BlockChainGas } from "../gas/gas";
import { ConvertToLaService } from "../utils/convert.la.service.util";
import { EncodeUtilService } from "../utils/encode.service.util";

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

  constructor({
    sender,
    to,
    amount,
    indexBlock,
    blockHash,
    users,
    timestamp,
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
  }

  private createTransactionHash(): string {
    const data = JSON.stringify({
      sender: this.sender,
      to: this.to,
      amount: this.amount,
      blockHash: this.blockHash,
      timestamp: this.timestamp,
      indexBlock: this.indexBlock,
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
      const payload = {
        blockHash: this.blockHash,
        indexBlock: this.indexBlock,
        sender: this.sender,
        to: this.to,
        amount: this.amount,
        timestamp: this.timestamp,
        users: this.users,
      };

      const data = this.encodeService.encodeTransactionData(payload);

      return { data, blockHash: this.blockHash, hash: this.hash };
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
          +this.convertLaService.toLa(this.users[sender.publicKey].balance) -
            (laAmount + gas)
        )
      );
      const newToBalance = this.convertLaService.toRei(
        String(
          +this.convertLaService.toLa(this.users[to.publicKey].balance) +
            laAmount
        )
      );

      this.users[sender.publicKey].balance = newSenderBalance;
      this.users[to.publicKey].balance = newToBalance.toString();

      return true;
    } catch (e) {
      throw e;
    }
  }

  public checkTransferUsers(senderAdr: string, toAdr: string) {
    try {
      const sender = this.users[senderAdr];

      this.require(sender !== undefined, "Sender not found");

      const to = this.users[toAdr];

      this.require(to !== undefined, "Participient not found");

      return { sender, to };
    } catch (e) {
      throw e;
    }
  }

  private createCommission(senderBal: number) {
    try {
      const gas = this.gasService.calculateGasPrice(
        BASIC_CONVERT_VALUES_ENUM.LA
      );

      console.log(senderBal, gas);

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

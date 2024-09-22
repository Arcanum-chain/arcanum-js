import { BlockChainStore } from "../../store";

import { ConvertToLaService } from "../../utils";

import type { Transaction } from "./transaction.interface";

export class TransactionActions {
  private readonly store: typeof BlockChainStore = BlockChainStore;
  private readonly convertLaService: ConvertToLaService;

  constructor() {
    this.convertLaService = new ConvertToLaService();
  }

  public async transfer(tx: Transaction): Promise<unknown> {
    try {
      const { sender, to } = await this.checkTransferUsers(
        tx.data.sender,
        tx.data.to
      );

      const senderBal = +this.convertLaService.toLa(sender.balance);
      const laAmount = +this.convertLaService.toLa(tx.data.amount.toString());
      const updatedSenderBal =
        senderBal - +this.convertLaService.toLa(String(tx.fee));

      this.require(updatedSenderBal >= laAmount, "Insufficient funds");

      const newSenderBalance = this.convertLaService.toRei(
        String(
          +this.convertLaService.toLa(
            (await this.store.getUserByAddress(sender.address)).balance
          ) -
            (laAmount + +this.convertLaService.toLa(String(tx.fee)))
        )
      );
      const newToBalance = this.convertLaService.toRei(
        String(
          +this.convertLaService.toLa(
            (await this.store.getUserByAddress(to.address)).balance
          ) + laAmount
        )
      );

      this.store.updateUserBalance(sender.address, newSenderBalance);
      this.store.updateUserBalance(to.address, newToBalance.toString());

      return true;
    } catch (e) {
      throw e;
    }
  }

  public async checkTransferUsers(senderAdr: string, toAdr: string) {
    try {
      const sender = await this.store.getUserByAddress(senderAdr);

      this.require(sender !== undefined, "Sender not found");

      const to = await this.store.getUserByAddress(toAdr);

      this.require(to !== undefined, "Participient not found");

      return { sender, to };
    } catch (e) {
      throw e;
    }
  }

  public require(logic: boolean, msg: string) {
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

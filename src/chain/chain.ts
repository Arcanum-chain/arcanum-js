import WebSocket from "ws";

import { BlockChainStore } from "../store";

import { Block } from "../block/block";
import { CalculateBlockToData } from "../calculateBlockToData/calcuateBlockToData";
import { MiningBlock } from "../mining/mining";
import { BlockTransaction } from "../transaction/transaction";
import { BlockChainUser } from "../user/user";
import { VerifyBlockService } from "../utils/verify.block.util.service";

import { DEFAULT_HASH_PREFIX } from "../constants/default.hash.prefix";
import { IS_MAIN_NODE, PEERS } from "../constants/peers.constanrs";

import type { BlockConstructor } from "../block/block.interface";
import type { Transaction } from "../transaction/transaction.interface";
import type { User } from "../user/user.interface";

export class BlockChain {
  public chain: Block[] = [];
  readonly pendingTransactions: Transaction[] = [];
  private readonly peers: string[];
  private users: Record<User["publicKey"], User> = {};
  private blockChainUser: BlockChainUser;
  private verifyBlockService: VerifyBlockService;
  private calculateRandomBlockToData: CalculateBlockToData;
  private readonly store: typeof BlockChainStore = BlockChainStore;

  constructor() {
    this.chain = IS_MAIN_NODE ? [] : [];
    this.peers = PEERS;
    this.broadcastBlock = this.broadcastBlock.bind(this);
    this.users = {};
    this.blockChainUser = new BlockChainUser(this.users);
    this.verifyBlockService = new VerifyBlockService();
    this.calculateRandomBlockToData = new CalculateBlockToData({
      blockChain: this.chain,
    });

    if (this) {
      return this;
    }
  }

  public createGenesisBlock() {
    const blockData: BlockConstructor["data"] = {
      transactions: {},
    };

    const payload: BlockConstructor = {
      index: 0,
      timestamp: Date.now(),
      prevBlockHash: "",
      data: blockData,
    };

    const block = new Block(payload);

    this.store.setNewBlockToChain(block);
    this.chain.push(block);

    return block;
  }

  public getChain() {
    try {
      return this.store.getChain();
    } catch (e) {
      throw e;
    }
  }

  public getLatestBlock() {
    return this.store.getChain()[this.store.getChain().length - 1];
  }

  public getBlockByHash(blockHash: string) {
    return this.chain[0];
  }

  public isValidChain(chain: Block[]) {
    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      if (currentBlock.prevBlockHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  public mineBlock() {
    const payload: BlockConstructor = {
      index: this.getLatestBlock()?.index + 1,
      timestamp: Date.now(),
      data: {
        transactions: {},
      },
      prevBlockHash: this.getLatestBlock()?.hash ?? "",
    };

    const newBlock = new Block(payload);

    new MiningBlock().mineBlock(newBlock);

    this.chain.push(newBlock);
    this.store.setNewBlockToChain(newBlock);

    const isValidChain = this.isValidChain(this.chain);

    // this.broadcastBlock(newBlock);

    if (isValidChain) {
      return newBlock;
    } else if (!isValidChain) {
      return new Error("Not valid chain!!!!");
    }
  }

  public replaceChain(newChain: Block[]) {
    if (newChain.length > this.chain.length && this.isValidChain(newChain)) {
      this.chain = newChain;
      console.log("Новая цепочка блоков принята");
    } else {
      console.log("Новая цепочка блоков недействительна");
    }
  }

  public broadcastBlock(block: Block) {
    const peers = this.peers ?? PEERS;

    peers.forEach((peer) => {
      const ws = new WebSocket(peer);

      ws.on("open", () => {
        ws.send(JSON.stringify({ type: "block", data: block }));
      });
    });
  }

  public broadcastUser(user: User) {
    try {
      const peers = this.peers ?? PEERS;

      peers.forEach((peer) => {
        const ws = new WebSocket(peer);

        ws.on("open", () => {
          ws.send(JSON.stringify({ type: "user", data: user }));
        });
      });
    } catch (e) {
      throw e;
    }
  }

  public createTransaction({
    sender,
    to,
    amount,
    signature,
  }: {
    sender: string;
    to: string;
    amount: number;
    signature: string;
  }) {
    try {
      const transaction = new BlockTransaction({
        sender,
        amount,
        timestamp: Date.now(),
        to,
        indexBlock: 0,
        blockHash: this.chain[this.chain.length - 1].hash,
        users: this.users,
        signature,
      });

      const result =
        this.calculateRandomBlockToData.mutateBlockToAddTransaction(
          transaction
        );

      return result;
    } catch (e) {
      throw e;
    }
  }

  public addNewUserToChain(newUsers: User) {
    try {
      const isEmptyUser = this.users[newUsers.publicKey];

      if (isEmptyUser) {
        throw new Error("Пользователь уже существует");
      }

      if (!newUsers.publicKey.startsWith(DEFAULT_HASH_PREFIX)) {
        throw new Error("Invalid hash");
      }

      this.store.setNewUser(newUsers);

      return true;
    } catch (e) {
      throw e;
    }
  }

  public async createNewUser() {
    try {
      const data = await this.blockChainUser.createNewUser();

      return data;
    } catch (e) {
      throw e;
    }
  }

  public getUserBalance(address: string) {
    try {
      return this.blockChainUser.getUserBalance(address);
    } catch (e) {
      throw e;
    }
  }

  public getAllUsers() {
    return this.store.getAllUsers();
  }

  private minerReward(minerAddress: string) {
    try {
    } catch (e) {
      throw e;
    }
  }
}

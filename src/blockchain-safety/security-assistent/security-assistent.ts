import { GasBlockChain } from "../../constants/gas.constants";
import { BlockChainError, BlockChainErrorCodes } from "../../errors";
import { BlockChainStore, MetadataBlockchainStore } from "../../store";
import {
  ConvertToLaService,
  MerkleTree,
  VerifyBlockService,
} from "../../utils";

import type { Transaction, IBlock, User } from "../../blockchain-common";

export class SecurityAssistent {
  private readonly store: typeof BlockChainStore = BlockChainStore;
  private readonly metaStore: typeof MetadataBlockchainStore =
    MetadataBlockchainStore;
  private readonly verifyBlockService: VerifyBlockService;
  private readonly merkleTreeService: MerkleTree;
  private readonly convertService: ConvertToLaService;

  constructor() {
    this.verifyBlockService = new VerifyBlockService();
    this.merkleTreeService = new MerkleTree();
    this.convertService = new ConvertToLaService();
  }

  private verifyAllTxsInBlock(
    txs: Record<Transaction["hash"], Transaction>,
    rootHash: string
  ) {
    try {
      this.merkleTreeService.verifyTxsMerkleTree(rootHash, Object.values(txs));
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.INVALID_CONSENSUS_STATUS);
    }
  }

  public verifyNewBlock(block: IBlock): boolean {
    try {
      this.verifyBlockService.isHashValid(block.hash);
      this.verifyBlockService.isHashProofed({
        hash: block.hash,
        difficulty: this.metaStore.getDifficulty,
      });

      this.calculateHashNewBlock(block);

      this.verifyChainConsensusBy40Blocks(block);
      this.verifyAllTxsInBlock(
        block.data.transactions,
        block.data.txMerkleRoot as string
      );

      return true;
    } catch (e) {
      throw e;
    }
  }

  private calculateHashNewBlock(block: IBlock): boolean {
    try {
      const payload = JSON.stringify({
        index: block.index,
        timestamp: block.timestamp,
        prevBlockHash: block.prevBlockHash,
      });

      const newBlockHash = this.verifyBlockService.genHash(payload);
      const verifyHash = this.verifyBlockService.genHash(
        newBlockHash + block.nonce
      );

      if (verifyHash !== block.hash) {
        throw new Error();
      }

      return true;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.INVALID_HASH_BLOCK);
    }
  }

  private async verifyChainConsensusBy40Blocks(newBlock: IBlock) {
    try {
      const chain = await this.store.getChain();
      chain.push(newBlock);
      const isVerify40Blocks = this.chainInLast40VerifyBlocks(chain);

      if (!isVerify40Blocks) {
        throw new BlockChainError(
          BlockChainErrorCodes.INVALID_CONSENSUS_STATUS
        );
      }

      return true;
    } catch (e) {
      throw e;
    }
  }

  public verifyAllChain(chain: IBlock[]) {
    try {
      for (let i = 1; i < chain.length; i++) {
        const currentBlock = chain[i];
        const previousBlock = chain[i - 1];

        if (currentBlock.prevBlockHash !== previousBlock.hash) {
          throw new BlockChainError(
            BlockChainErrorCodes.INVALID_CONSENSUS_STATUS
          );
        }
      }

      return true;
    } catch {
      throw new BlockChainError(BlockChainErrorCodes.INVALID_CONSENSUS_STATUS);
    }
  }

  public usersExist(senderAdr: string, toAdr: string): boolean {
    try {
      const sender = this.store.getUserByAddress(senderAdr);
      const to = this.store.getUserByAddress(toAdr);

      if (!sender || !to) {
        throw new BlockChainError(BlockChainErrorCodes.NOT_FOUND_ENTITY);
      }

      return true;
    } catch (e) {
      throw e;
    }
  }

  public async verifyNewTxInMemPoolFromOtherNode(tx: Transaction) {
    try {
      this.verifyBlockService.isHashValid(tx.hash);

      const currentTime = Date.now();
      const fourtyMinutesAgo = currentTime - 40 * 60 * 1000;

      if (tx.data.timestamp < fourtyMinutesAgo) {
        throw new Error();
      }

      if (+this.convertService.toLa(String(tx.fee)) < GasBlockChain.MIN_GAS) {
        throw new Error();
      }

      this.checkUsersInNewTx(tx);

      const isDubleTx = (
        await this.store.getAllTransactionsFromMemPull()
      ).filter((trans) => {
        return tx.hash === trans.hash;
      });

      if (isDubleTx) {
        throw new BlockChainError(BlockChainErrorCodes.DUPLICATE_DATA);
      }

      return true;
    } catch (e) {
      throw e;
    }
  }

  public async verifyNewUserFromNode(user: User) {
    try {
      const emptyUser = await this.store.getUserByAddress(user.address);

      if (emptyUser) {
        throw new BlockChainError(BlockChainErrorCodes.DUPLICATE_DATA);
      }

      return true;
    } catch (e) {
      console.log(e);
    }
  }

  private async checkUsersInNewTx(tx: Transaction) {
    try {
      const sender = tx.data.sender;
      const to = tx.data.to;
      const amount = tx.data.amount;

      const senderFromChain = await this.store.getUserByAddress(sender);
      await this.store.getUserByAddress(to);

      if (+senderFromChain.balance - tx.fee < amount) {
        throw new BlockChainError(
          BlockChainErrorCodes.INVALID_TRANSACTIONS_DATA_BY_NODE
        );
      }
    } catch (e) {
      throw e;
    }
  }

  private chainInLast40VerifyBlocks(chain: IBlock[]) {
    try {
      const isGenesisBlock = this.isGenesisBlock(
        chain[chain.length - 1],
        chain
      );
      const length = chain.length >= 41 ? chain.length - 40 : chain.length;

      if (isGenesisBlock) {
        return true;
      }

      // for (let i = chain.length - 1; i > length; i--) {
      //   const currentBlock = chain[i];
      //   const previousBlock = chain[i - 1];

      //   console.log(i, i - 1);

      //   if (currentBlock.prevBlockHash !== previousBlock.hash) {
      //     return false;
      //   }
      // }

      for (let i = 1; i < chain.length; i++) {
        const currentBlock = chain[i];
        const previousBlock = chain[i - 1];

        if (currentBlock.prevBlockHash !== previousBlock.hash) {
          return false;
        }
      }

      return true;
    } catch (e) {
      throw e;
    }
  }

  private isGenesisBlock(newBlock: IBlock, chain: IBlock[]) {
    try {
      if (chain.length === 0 && newBlock.index === 0) {
        return true;
      }

      return false;
    } catch (e) {
      throw e;
    }
  }
}

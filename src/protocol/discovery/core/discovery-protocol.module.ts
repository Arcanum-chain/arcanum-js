import EventEmitter from "events";

import { bytesToInt, bytesToUnPrefixedHex, randomBytes } from "../../../utils";

import { KBucket } from "../../k-bucket/k-bucket.service";
import { Server } from "./server/dpt.server";
import { BanListPeersService } from "../../ban-list/ban-list.service";

import {
  bytesToHexString,
  convertN2NTypeToContact,
  convertHexStrToUint,
  convertContactToN2NNode,
} from "../utils/index";

import type { DTPOptions } from "../interface/message.interface";
import type { N2NNode } from "../../n2nProtocol";
import type { Contact } from "../../types";

export class DiscoveryProtocol {
  public events: EventEmitter = new EventEmitter();
  private readonly kBucket: KBucket;
  private readonly server: Server;
  private readonly banList: BanListPeersService;
  private readonly confirmedPeers: Set<string>;
  private readonly onlyConfirmed: boolean;
  private readonly id: string;
  private readonly shouldFindNeighbours: boolean;
  private readonly refreshIntervalId: NodeJS.Timeout;
  private refreshIntervalSelectionCounter: number = 0;

  constructor(nodeId: string, opt: DTPOptions) {
    this.kBucket = KBucket.getInstance();
    this.server = new Server(this, opt);
    this.banList = BanListPeersService.getInstance();
    this.confirmedPeers = new Set();
    this.onlyConfirmed = opt.onlyConfirmed ?? false;
    this.id = nodeId;
    this.shouldFindNeighbours = opt.shouldFindNeighbours ?? true;

    this.server.events.once("listening", () => this.events.emit("listening"));
    this.server.events.once("close", () => this.events.emit("close"));
    this.server.events.on("error", (err) => this.events.emit("error", err));
    this.server.events.on("peers", (peers) => {
      if (!this.shouldFindNeighbours) return;
      this.addPeerBatch(peers);
    });

    // By default calls refresh every 3s
    const refreshIntervalSubdivided = Math.floor(
      (opt.refreshInterval ?? 60000) / 10
    ); // 60 sec * 1000
    this.refreshIntervalId = setInterval(
      () => this.refresh(),
      refreshIntervalSubdivided
    );
  }

  public async bootstrap(node: N2NNode): Promise<void> {
    let peer = convertN2NTypeToContact(node);
    try {
      peer = await this.addPeer(peer);

      if (peer.id !== undefined) {
        this.confirmedPeers.add(bytesToHexString(peer.id));
      }
    } catch (error: any) {
      return;
    }
    if (!this.id) return;
    if (this.shouldFindNeighbours) {
      this.server.findneighbours(peer, convertHexStrToUint(this.id));
    }
  }

  public getAllPeers() {
    return this.kBucket.getAll();
  }

  public getPeer(peerId: string) {
    return this.kBucket.get(peerId);
  }

  public getClosestPeers(nodeId: string) {
    let peers = this.kBucket.closest(nodeId);

    if (this.onlyConfirmed && this.confirmedPeers.size > 0) {
      peers = peers.filter((peer) =>
        this.confirmedPeers.has(bytesToHexString(peer.id))
      );
    }

    return peers;
  }

  public removePeer(obj: string) {
    const peer = this.kBucket.get(obj);
    if (peer?.id !== undefined) {
      this.confirmedPeers.delete(bytesToHexString(peer.id as Uint8Array));
    }
    this.kBucket.remove(obj);
  }

  public banPeer(obj: N2NNode, maxAge?: number) {
    this.banList.add(obj.nodeId, maxAge);
    this.kBucket.remove(obj.nodeId);
  }

  public numPeers() {
    return this.kBucket.getAll().length;
  }

  public async addPeer(obj: Contact): Promise<Contact> {
    if (this.banList.has(obj.reiNodeUrl as string)) {
      throw new Error("Peer is banned");
    }

    const peer = this.kBucket.get(bytesToHexString(obj.id));
    if (peer !== null) return peer;

    try {
      const peer: Contact = await this.server.ping(obj);
      const n2nNode = convertContactToN2NNode(peer);
      this.events.emit("peer:new", peer);
      this.kBucket.add(n2nNode);
      return peer;
    } catch (err) {
      this.banList.add(bytesToHexString(obj.id), 300000); // 5 min * 60 * 1000
      throw err;
    }
  }

  public confirmPeer(id: string) {
    if (this.confirmedPeers.size < 5000) {
      this.confirmedPeers.add(id);
    }
  }

  private addPeerBatch(peers: Contact[]): void {
    const DIFF_TIME_MS = 200;
    let ms = 0;
    for (const peer of peers) {
      setTimeout(() => {
        this.addPeer(peer).catch((error) => {
          this.events.emit("error", error);
        });
      }, ms);
      ms += DIFF_TIME_MS;
    }
  }

  public async refresh(): Promise<void> {
    if (this.shouldFindNeighbours) {
      this.refreshIntervalSelectionCounter =
        (this.refreshIntervalSelectionCounter + 1) % 10;

      const peers = this.getAllPeers();

      for (const peer of peers) {
        const selector =
          bytesToInt((peer.id as Uint8Array).subarray(0, 1)) % 10;
        let confirmed = true;
        if (this.onlyConfirmed && this.confirmedPeers.size > 0) {
          const id = bytesToUnPrefixedHex(peer.id as Uint8Array);
          if (!this.confirmedPeers.has(id)) {
            confirmed = false;
          }
        }
        if (confirmed && selector === this.refreshIntervalSelectionCounter) {
          this.server.findneighbours(peer, randomBytes(64));
        }
      }
    }
  }
}

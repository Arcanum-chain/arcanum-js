import kBucket from "k-bucket";

import { Singleton } from "../../basic";

import { N2NParseUrl } from "../parse-url/parse-url.service";
import { bytesToHexString } from "../discovery/utils";

import type { Contact } from "../types";
import type { N2NNode } from "../n2nProtocol";

export class KBucket extends Singleton {
  private readonly bucket: kBucket;
  private readonly urlParser: N2NParseUrl;

  constructor() {
    super();

    this.bucket = new kBucket<Contact>();
    this.urlParser = new N2NParseUrl();
  }

  public closest(nodeId: string): Contact[] {
    const id = this.toUint(nodeId);

    return this.bucket.closest(id);
  }

  public add(peer: N2NNode) {
    const payload: Contact = {
      id: this.toUint(peer.nodeId),
      address: this.urlParser.getIp(peer.url) as string,
      vectorClock: 0,
      udpPort: peer.udpPort,
      tcpPort: this.urlParser.getPort(peer.url),
      reiNodeUrl: peer.url,
      publicKey: peer.publicKey,
      ownerAddress: peer.user,
    };

    this.bucket.add(payload);
  }

  public getAll(): Contact[] {
    return this.bucket.toArray();
  }

  public get(nodeId: string): Contact | null {
    const id = this.toUint(nodeId);

    return this.bucket.get(id);
  }

  public get getBucket(): kBucket {
    return this.bucket;
  }

  public remove(nodeId: string) {
    const id = this.toUint(nodeId);
    this.bucket.remove(id);
  }

  private toUint(string: string): Uint8Array {
    return Uint8Array.from(
      Array.from(string).map((letter) => letter.charCodeAt(0))
    );
  }
}

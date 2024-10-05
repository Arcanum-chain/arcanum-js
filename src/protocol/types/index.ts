import { Deferred } from "../discovery/utils";
import type { N2NResponse } from "../n2nProtocol";

export interface Contact {
  id: Uint8Array;
  address?: string;
  udpPort?: number | null;
  tcpPort?: number | null;
  vectorClock: number;
  reiNodeUrl?: string;
  ownerAddress?: string;
  publicKey?: string;
}

export interface KBucketOptions {
  /**
   * An optional Uint8Array representing the local node id.
   * If not provided, a local node id will be created via `randomBytes(20)`.
   */
  localNodeId: string;
  /**
   * The number of nodes that a k-bucket can contain before being full or split.
   * Defaults to 20.
   */
  numberOfNodesPerKBucket?: number;
  /**
   * The number of nodes to ping when a bucket that should not be split becomes full.
   * KBucket will emit a `ping` event that contains `numberOfNodesToPing` nodes that have not been contacted the longest.
   * Defaults to 3.
   */
  numberOfNodesToPing?: number;
  /**
   * An optional distance function that gets two id Uint8Arrays and return distance between them as a number.
   */
  distance?: (firstId: Uint8Array, secondId: Uint8Array) => number;
  /**
   * An optional arbiter function that given two `contact` objects with the same `id`,
   * returns the desired object to be used for updating the k-bucket.
   * Defaults to vectorClock arbiter function.
   */
  arbiter?: (incumbent: Contact, candidate: Contact) => Contact;
  /**
   * Optional satellite data to include
   * with the k-bucket. `metadata` property is guaranteed not be altered by,
   * it is provided as an explicit container for users of k-bucket to store
   * implementation-specific data.
   */
  metadata?: object;
}

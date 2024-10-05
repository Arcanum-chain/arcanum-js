import type { Contact } from "../../types";
import type { N2NNode } from "../../n2nProtocol";

import { N2NParseUrl } from "../../parse-url/parse-url.service";

export class Deferred<T> {
  promise: Promise<T>;
  resolve: (...args: any[]) => any = () => {};
  reject: (...args: any[]) => any = () => {};
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export function createDeferred<T>(): Deferred<T> {
  return new Deferred();
}

export const bytesToHexString = (value: Uint8Array) => {
  if (typeof value === "undefined") {
    return "0x";
  }

  return Array.from(value)
    .map((i) => i.toString(16).padStart(2, "0"))
    .join("");
};

export function convertHexStrToUint(string: string): Uint8Array {
  return Uint8Array.from(
    Array.from(string).map((letter) => letter.charCodeAt(0))
  );
}

export const convertN2NTypeToContact = (node: N2NNode) => {
  const contact: Contact = {
    id: convertHexStrToUint(node.nodeId),
    vectorClock: 0,
    ownerAddress: node.user,
    publicKey: node.publicKey,
    tcpPort: node.tcpPort,
    udpPort: node.udpPort,
    address: new N2NParseUrl().getIp(node.url) as string,
    reiNodeUrl: node.url,
  };

  return contact;
};

export const convertContactToN2NNode = (contact: Contact) => {
  const n2nNode: N2NNode = {
    url: contact.reiNodeUrl as string,
    user: contact.ownerAddress as string,
    nodeId: bytesToHexString(contact.id),
    publicKey: contact.publicKey as string,
    udpPort: contact.udpPort as number,
    tcpPort: contact.tcpPort as number,
  };

  return n2nNode;
};

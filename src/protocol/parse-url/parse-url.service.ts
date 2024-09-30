import url from "node:url";

export class N2NParseUrl {
  public getWsUrl(reiUrl: string) {
    try {
      const urlParts = url.parse(reiUrl);

      if (urlParts.protocol === "reinode:") {
        const nodeId = urlParts.auth;
        const address = urlParts.hostname;
        const port = parseInt(urlParts.port as string, 10);

        return { url: `ws://${address}:${port}`, nodeId: nodeId };
      } else {
        throw new Error(
          `Invalid protocol, expected "reinode:", received "${reiUrl}"`
        );
      }
    } catch (e) {
      throw e;
    }
  }

  public createReiUrl(nodeId: string, address: string, port: number) {
    try {
      return `reinode://${nodeId}@${address}:${port}`;
    } catch (e) {
      throw e;
    }
  }

  public getIp(reiUrl: string) {
    const urlParts = url.parse(reiUrl);

    if (urlParts.protocol === "reinode:") {
      return urlParts.hostname;
    }

    throw new Error(
      `Invalid protocol, expected "reinode:", received "${reiUrl}"`
    );
  }

  public getPort(reiUrl: string) {
    const urlParts = url.parse(reiUrl);

    if (urlParts.protocol === "reinode:") {
      return parseInt(urlParts.port as string, 10);
    }

    throw new Error(
      `Invalid protocol, expected "reinode:", received "${reiUrl}"`
    );
  }
}

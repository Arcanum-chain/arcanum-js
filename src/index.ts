import express from "express";
import WebSocket from "ws";

import { EventMessage } from "./constants";
import { PORT, WS_PORT } from "./constants/peers.constanrs";
import { BlockChainStore } from "./store";

import { BlockChain } from "./chain/chain";
// import { N2NProtocol } from "./n2nProtocol/n2n.protocol";
import { DumpingService } from "./dumping/dumping";

const blockChain = new BlockChain();
const dump = new DumpingService();
// const protocol = new N2NProtocol(4030, "ws://localhost:4030", "0xewfkfmfew");

// protocol.createServer();
// dump.dumpingBlockchain(blockChain.chain);
BlockChainStore.on(EventMessage.BLOCK_ADDED, (block) => {
  console.log("New mining block:", block);
});

const app = express();
app.use(express.json());

app.get("/chain", (req, res) => {
  res.json(blockChain.chain);
});

app.post("/mine", (req, res) => {
  blockChain.mineBlock();
  res.send("Блок добыт");
});

app.post("/user", (req, res) => {
  res.send(blockChain.createNewUser());
});

app.get("/user", (req, res) => {
  res.send(blockChain.getAllUsers());
});

app.post("/user-secret", (req, res) => {
  console.log(req.body);

  const { publicKey, sedCode } = req.body;

  const data = blockChain.getUserSecrets(publicKey, sedCode);

  res.send(data);
});

app.post("/trans", (req, res) => {
  try {
    const body = req.body;

    const result = blockChain.createTransaction(body);

    res.send(result);
  } catch (e) {
    console.log(e);
    res.status(500).send((e as Error).message);
  }
});

// WebSocket-сервер для связи с другими узлами
const wss = new WebSocket.Server({ port: WS_PORT });

wss.on("connection", (ws) => {
  console.log("Новый узел подключен");

  ws.on("message", (message: string) => {
    const data = JSON.parse(message);
    switch (data.type) {
      case "block":
        if (blockChain.isValidChain(blockChain.chain.concat(data.data))) {
          blockChain.replaceChain(blockChain.chain.concat(data.data));
        }
        break;
      case "user":
        blockChain.addNewUserToChain(data.data);
        break;
    }
  });

  ws.on("close", () => {
    console.log("Узел отключен");
  });
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

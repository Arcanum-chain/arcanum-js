import express from "express";

import { PORT } from "./constants/peers.constanrs";

import { AutoScheduleService } from "./auto-schedule/auto-shedule.service";
import { BlockChain } from "./chain/chain";
import { ChocolateJo } from "./chocolateJo/chocolateJo";
import { DumpingService } from "./dumping/dumping";
import { MemPool } from "./memPool/memPool";
import { N2NProtocol } from "./n2nProtocol/n2n.protocol";

const blockChain = new BlockChain();
const dump = new DumpingService();
const protocol = new N2NProtocol(
  Number(process.env.WS_PORT),
  process.env.WS_NODE_URL as string,
  "0xewfkfmfew",
  { isMainNode: JSON.parse(process.env.IS_MAIN_NODE as string) }
);
const chocolateJo = new ChocolateJo(protocol);
new AutoScheduleService();
MemPool.getInstance();

if (JSON.parse(process.env.IS_MAIN_NODE as string)) {
  blockChain.createGenesisBlock();
}

protocol.createServer();

const app = express();
app.use(express.json());

app.get("/chain", (req, res) => {
  try {
    res.json(blockChain.getChain());
  } catch (e) {
    res.json(e);
  }
});

app.post("/mine", (req, res) => {
  try {
    blockChain.mineBlock(req.body.key);
    res.send("Блок добыт");
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

app.get("/trans", (req, res) => {
  try {
    const result = blockChain.getTxs();

    res.json(result);
  } catch (e) {
    console.log(e);
    res.status(400).send("Fail");
  }
});

app.post("/user", async (req, res) => {
  try {
    const data = await blockChain.createNewUser();

    res.send(data);
  } catch (e) {
    res.status(500).send(e);
  }
});

app.get("/user", (req, res) => {
  res.send(blockChain.getAllUsers());
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
// const wss = new WebSocket.Server({ port: WS_PORT });

// wss.on("connection", (ws) => {
//   console.log("Новый узел подключен");

//   ws.on("message", (message: string) => {
//     const data = JSON.parse(message);
//     switch (data.type) {
//       case "block":
//         if (blockChain.isValidChain(blockChain.chain.concat(data.data))) {
//           blockChain.replaceChain(blockChain.chain.concat(data.data));
//         }
//         break;
//       case "user":
//         blockChain.addNewUserToChain(data.data);
//         break;
//     }
//   });

//   ws.on("close", () => {
//     console.log("Узел отключен");
//   });
// });

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

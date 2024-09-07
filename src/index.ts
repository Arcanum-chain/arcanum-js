// import cors from "cors";
// import express from "express";

// import { PORT } from "./constants/peers.constanrs";

// import { AutoScheduleService } from "./auto-schedule/auto-shedule.service";
// import { BlockChain } from "./chain/chain";
// import { ChocolateJo } from "./chocolateJo/chocolateJo";
// import { MemPool } from "./memPool/memPool";
// import { N2NProtocol } from "./n2nProtocol/n2n.protocol";

import { NodeStarter } from "./starter/starter.module";

const starter = new NodeStarter();

async function start() {
  try {
    await starter.start();
  } catch (e) {
    console.log(`[NODE]: ${(e as Error).message}`);
  }
}

start();

// const blockChain = new BlockChain();
// const protocol = new N2NProtocol(
//   Number(process.env.WS_PORT),
//   process.env.WS_NODE_URL as string,
//   "0xewfkfmfew",
//   { isMainNode: JSON.parse(process.env.IS_MAIN_NODE as string) }
// );

// new ChocolateJo(protocol);
// new AutoScheduleService();
// MemPool.getInstance();

// if (JSON.parse(process.env.IS_MAIN_NODE as string)) {
//   blockChain.createGenesisBlock();
// }

// protocol.createServer();

// const app = express();
// app.use(express.json());
// app.use(cors({ origin: "*" }));

// app.get("/chain", async (req, res) => {
//   try {
//     const data = await blockChain.getChain();

//     res.json(data);
//   } catch (e) {
//     res.json(e);
//   }
// });

// app.post("/mine", async (req, res) => {
//   try {
//     await blockChain.mineBlock(req.body.key);
//     res.send("Блок добыт");
//   } catch (e) {
//     console.log(e);
//     res.status(400).send(e);
//   }
// });

// app.get("/trans", (req, res) => {
//   try {
//     const result = blockChain.getTxs();

//     res.json(result);
//   } catch (e) {
//     console.log(e);
//     res.status(400).send("Fail");
//   }
// });

// app.post("/user", async (req, res) => {
//   try {
//     const data = await blockChain.createNewUser();

//     res.send(data);
//   } catch (e) {
//     console.log(e);
//     res.status(500).json((e as Error).message);
//   }
// });

// app.get("/user", (req, res) => {
//   res.send(blockChain.getAllUsers());
// });

// app.post("/trans/", (req, res) => {
//   try {
//     const body = req.body;

//     const result = blockChain.createTransaction(body);

//     res.send(result);
//   } catch (e) {
//     console.log(e);
//     res.status(500).send((e as Error).message);
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Сервер запущен на порту ${PORT}`);
// });

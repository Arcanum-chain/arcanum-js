"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const peers_constanrs_1 = require("./constants/peers.constanrs");
const auto_shedule_service_1 = require("./auto-schedule/auto-shedule.service");
const chain_1 = require("./chain/chain");
const chocolateJo_1 = require("./chocolateJo/chocolateJo");
const dumping_1 = require("./dumping/dumping");
const memPool_1 = require("./memPool/memPool");
const n2n_protocol_1 = require("./n2nProtocol/n2n.protocol");
const blockChain = new chain_1.BlockChain();
const dump = new dumping_1.DumpingService();
const protocol = new n2n_protocol_1.N2NProtocol(Number(process.env.WS_PORT), process.env.WS_NODE_URL, "0xewfkfmfew", { isMainNode: JSON.parse(process.env.IS_MAIN_NODE) });
const chocolateJo = new chocolateJo_1.ChocolateJo(protocol);
new auto_shedule_service_1.AutoScheduleService();
memPool_1.MemPool.getInstance();
if (JSON.parse(process.env.IS_MAIN_NODE)) {
    blockChain.createGenesisBlock();
}
protocol.createServer();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/chain", (req, res) => {
    try {
        res.json(blockChain.getChain());
    }
    catch (e) {
        res.json(e);
    }
});
app.post("/mine", (req, res) => {
    try {
        blockChain.mineBlock(req.body.key);
        res.send("Блок добыт");
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});
app.get("/trans", (req, res) => {
    try {
        const result = blockChain.getTxs();
        res.json(result);
    }
    catch (e) {
        console.log(e);
        res.status(400).send("Fail");
    }
});
app.post("/user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield blockChain.createNewUser();
        res.send(data);
    }
    catch (e) {
        res.status(500).send(e);
    }
}));
app.get("/user", (req, res) => {
    res.send(blockChain.getAllUsers());
});
app.post("/trans", (req, res) => {
    try {
        const body = req.body;
        const result = blockChain.createTransaction(body);
        res.send(result);
    }
    catch (e) {
        console.log(e);
        res.status(500).send(e.message);
    }
});
app.listen(peers_constanrs_1.PORT, () => {
    console.log(`Сервер запущен на порту ${peers_constanrs_1.PORT}`);
});
//# sourceMappingURL=index.js.map
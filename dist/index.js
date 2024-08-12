"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = __importDefault(require("ws"));
const peers_constanrs_1 = require("./constants/peers.constanrs");
const chain_1 = require("./chain/chain");
const blockChain = new chain_1.BlockChain();
const app = (0, express_1.default)();
app.use(express_1.default.json());
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
    }
    catch (e) {
        console.log(e);
        res.status(500).send(e.message);
    }
});
const wss = new ws_1.default.Server({ port: peers_constanrs_1.WS_PORT });
wss.on("connection", (ws) => {
    console.log("Новый узел подключен");
    ws.on("message", (message) => {
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
app.listen(peers_constanrs_1.PORT, () => {
    console.log(`Сервер запущен на порту ${peers_constanrs_1.PORT}`);
});
//# sourceMappingURL=index.js.map
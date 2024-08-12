"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IS_MAIN_NODE = exports.PORT = exports.WS_PORT = exports.PEERS = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.PEERS = JSON.parse(process.env.WS_CHILDS);
exports.WS_PORT = Number(process.env.WS_PORT);
exports.PORT = Number(process.env.PORT);
exports.IS_MAIN_NODE = JSON.parse((_a = process.env.IS_MAIN_NODE) !== null && _a !== void 0 ? _a : "false");
//# sourceMappingURL=peers.constanrs.js.map
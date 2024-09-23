"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = exports.WS_PORT = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.WS_PORT = Number(process.env.WS_PORT);
exports.PORT = Number(process.env.PORT);
//# sourceMappingURL=peers.constanrs.js.map
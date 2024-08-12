import { config } from "dotenv";

config();

export const PEERS = JSON.parse(process.env.WS_CHILDS as string);
export const WS_PORT = Number(process.env.WS_PORT);
export const PORT = Number(process.env.PORT);
export const IS_MAIN_NODE = JSON.parse(process.env.IS_MAIN_NODE ?? "false");

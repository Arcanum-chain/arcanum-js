import { config } from "dotenv";

config();

export const WS_PORT = Number(process.env.WS_PORT);
export const PORT = Number(process.env.PORT);

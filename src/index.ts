import { NodeStarter } from "./starter/starter.module";
import { Logger } from "./logger";

const starter = new NodeStarter();
const logger = new Logger();

async function start() {
  try {
    await starter.start();
  } catch (e) {
    logger.error((e as Error).message);
  }
}

start();

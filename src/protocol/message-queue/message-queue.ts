import EventEmitter from "events";

import { Logger } from "../../logger";

import { N2NProtocol } from "../n2nProtocol";

import type { MessageQueueOpt } from "./interface/opt.interface";
import type { N2NResponse } from "../n2nProtocol";

export class MessageQueue extends EventEmitter {
  protected readonly timeout: number;
  protected readonly maxPeerInQueue: number;
  protected readonly maxQueueSize: number;
  private readonly logger: Logger;
  private readonly queue: N2NResponse<any>[];
  private readonly protocol: N2NProtocol;
  private processing = false;

  constructor(protocol: N2NProtocol, opt: MessageQueueOpt) {
    super();

    this.logger = new Logger(MessageQueue.name);
    this.timeout = opt.timeout ?? 10000;
    this.maxPeerInQueue = opt.maxPeerInQueue ?? 1000;
    this.maxQueueSize = opt.maxQueueSize ?? 1000;

    this.protocol = protocol;
    this.queue = [];
  }

  public enqueue<T>(message: N2NResponse<T>) {
    if (this.isFull()) {
      this.emit("queueOverflow");
      this.logger.warn("Queue overflow");
      return false;
    }

    this.queue.push(message);
    this.emit("messageEnqueued", message);

    if (!this.processing) {
      this.processQueue();
    }

    return true;
  }

  private async processQueue() {
    this.processing = true;

    const messages = this.queue;

    try {
      await Promise.all(
        messages.map(async (message) => {
          try {
            await this.protocol.broadcastMessage(message);
          } catch (e) {
            this.logger.error(
              `Error processing message ${message.headers.origin}: ${
                (e as Error).message
              }`
            );
          }
        })
      );
    } catch (error) {
      this.logger.error(
        `Error processing message: ${(error as Error).message}`
      );
    }

    this.processing = false;
  }

  public dequeue() {
    if (this.queue.length === 0) {
      this.logger.info("Queue empty");
      return null;
    }

    const message = this.queue.shift();
    return message;
  }

  public peek() {
    if (this.queue.length === 0) {
      this.logger.info("Queue empty");
      return null;
    }
    return this.queue[0];
  }

  public isEmpty() {
    return this.queue.length === 0;
  }

  public isFull() {
    return this.queue.length >= this.maxQueueSize;
  }

  public getQueueSize() {
    return this.queue.length;
  }
}

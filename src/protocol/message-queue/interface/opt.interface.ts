export interface MessageQueueOpt {
  readonly timeout?: number;
  readonly maxPeerInQueue?: number;
  readonly maxQueueSize?: number;
}

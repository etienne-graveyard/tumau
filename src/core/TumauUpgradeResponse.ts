import { IncomingMessage } from 'http';
import { Duplex } from 'stream';
import { TumauBaseResponse } from './TumauBaseResponse';

export type UpgradeResponseHandler = (req: IncomingMessage, socket: Duplex, head: Buffer) => Promise<void>;

export class TumauUpgradeResponse extends TumauBaseResponse {
  public readonly handler: UpgradeResponseHandler;

  constructor(handler: UpgradeResponseHandler) {
    super();
    this.handler = handler;
  }

  public static fromError(err: unknown): TumauUpgradeResponse {
    return new TumauUpgradeResponse(async (_req, socket) => {
      console.error(err);
      socket.destroy();
    });
  }
}

import { TumauBaseResponse } from './TumauBaseResponse';
import { IncomingMessage, ServerResponse } from 'http';

export type RequestHander = (req: IncomingMessage, res: ServerResponse) => Promise<void> | void;

export class TumauHandlerResponse extends TumauBaseResponse {
  public readonly handler: RequestHander;

  public constructor(handler: RequestHander) {
    super();
    this.handler = handler;
  }
}

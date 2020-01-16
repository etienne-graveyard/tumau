import { IncomingMessage, IncomingHttpHeaders } from 'http';
import { HttpMethod } from './HttpMethod';
import { notNill } from './utils';
import { HttpHeaders } from './HttpHeaders';

export interface TumauRequestOptions {
  // does it come from server.on('upgrade', ...);
  isUpgrade?: boolean;
}

export class TumauRequest {
  public readonly req: IncomingMessage;
  public readonly method: HttpMethod;
  public readonly url: string;
  public readonly headers: IncomingHttpHeaders;
  public readonly origin: string | null;
  public readonly isUpgrade: boolean;

  constructor(req: IncomingMessage, options: TumauRequestOptions = {}) {
    const { isUpgrade = false } = options;
    const url = notNill(req.url); // never null because IncomingMessage come from http.Server
    const method = notNill(req.method) as HttpMethod;
    const origin: string | null = (req.headers[HttpHeaders.Origin] as string | undefined) || null;

    this.isUpgrade = isUpgrade;
    this.req = req;
    this.url = url;
    this.method = method;
    this.headers = req.headers;
    this.origin = origin;
  }
}

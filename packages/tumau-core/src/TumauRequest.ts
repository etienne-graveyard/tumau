import { IncomingMessage, IncomingHttpHeaders } from 'http';
import { HttpMethod } from './HttpMethod';
import { notNill } from './utils';
import { HttpHeaders } from './HttpHeaders';

export class TumauRequest {
  public req: IncomingMessage;
  public method: HttpMethod;
  public url: string;
  public headers: IncomingHttpHeaders;
  public origin: string | null;

  constructor(req: IncomingMessage) {
    const url = notNill(req.url); // never null because IncomingMessage come from http.Server
    const method = notNill(req.method) as HttpMethod;
    const origin: string | null = (req.headers[HttpHeaders.Origin] as string | undefined) || null;

    this.req = req;
    this.url = url;
    this.method = method;
    this.headers = req.headers;
    this.origin = origin;
  }
}

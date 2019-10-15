import { IncomingHttpHeaders } from 'http';
import { Readable } from 'stream';

interface Options {
  method?: string;
  path?: string;
  headers?: IncomingHttpHeaders;
  body?: string | Readable;
}

export class Request {
  public method: string;
  public path: string;
  public headers: IncomingHttpHeaders;
  public body: null | string | Readable;

  public constructor(opts: Options = {}) {
    const { headers = {}, method = 'GET', path = '/', body = null } = opts;
    this.headers = headers;
    this.method = method;
    this.path = path;
    this.body = body;
  }

  public static get(path: string, headers: IncomingHttpHeaders = {}): Request {
    return new Request({ method: 'GET', path, headers });
  }

  public static post(path: string, headers: IncomingHttpHeaders = {}): Request {
    return new Request({ method: 'POST', path, headers });
  }

  public static put(path: string, headers: IncomingHttpHeaders = {}): Request {
    return new Request({ method: 'PUT', path, headers });
  }
}

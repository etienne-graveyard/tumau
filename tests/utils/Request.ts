import { IncomingHttpHeaders } from 'http';
import { HttpMethod } from '@tumau/core';
import { Readable } from 'stream';

interface Options {
  method?: HttpMethod;
  path?: string;
  headers?: IncomingHttpHeaders;
  body?: string | Readable;
}

export class Request {
  public method: HttpMethod;
  public path: string;
  public headers: IncomingHttpHeaders;
  public body: null | string | Readable;

  public constructor(opts: Options = {}) {
    const { headers = {}, method = HttpMethod.GET, path = '/', body = null } = opts;
    this.headers = headers;
    this.method = method;
    this.path = path;
    this.body = body;
  }

  public static get(path: string, headers: IncomingHttpHeaders = {}): Request {
    return new Request({ method: HttpMethod.GET, path, headers });
  }

  public static post(path: string, headers: IncomingHttpHeaders = {}): Request {
    return new Request({ method: HttpMethod.POST, path, headers });
  }

  public static put(path: string, headers: IncomingHttpHeaders = {}): Request {
    return new Request({ method: HttpMethod.PUT, path, headers });
  }
}

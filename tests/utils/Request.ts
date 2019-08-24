import { IncomingHttpHeaders } from 'http';
import { HttpMethod } from '@tumau/core';

interface Options {
  method?: HttpMethod;
  path?: string;
  headers?: IncomingHttpHeaders;
}

export class Request {
  public method: HttpMethod;
  public path: string;
  public headers: IncomingHttpHeaders;

  public constructor(opts: Options = {}) {
    const { headers = {}, method = HttpMethod.GET, path = '/' } = opts;
    this.headers = headers;
    this.method = method;
    this.path = path;
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

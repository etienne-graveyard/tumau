import { OutgoingHttpHeaders, ServerResponse } from 'http';
import { HttpStatus, HttpStatusCode } from './HttpStatus';
import { Context } from './Context';
import { HttpMethod } from './HttpMethod';
import { HttpHeaders, ContentType } from './HttpHeaders';

export interface Response {
  res: ServerResponse;
  create(options?: SendOptions, config?: { force?: boolean }): void;
  clearBody(): void;
  sent: boolean;
  __send(ctx: Context): void;
}

export const Response = {
  create: createResponse,
};

interface SendOptions {
  code?: HttpStatusCode;
  json?: object | null;
  headers?: OutgoingHttpHeaders;
}

interface SendData {
  code: HttpStatusCode;
  json: object | null;
  headers: OutgoingHttpHeaders;
}

async function createResponse(res: ServerResponse): Promise<Response> {
  let responseData: SendData | null = null;

  const response: Response = {
    res,
    create,
    get sent(): boolean {
      return responseData !== null;
    },
    clearBody,
    __send,
  };

  return response;

  function create(options: SendOptions = {}, config: { force?: boolean } = {}): void {
    const { force = false } = config;
    if (responseData !== null && force === false) {
      throw new Error(`responseData already set !`);
    }
    const { code = 200, headers = {}, json = {} } = options;
    responseData = {
      code,
      headers,
      json,
    };
  }

  function clearBody(): void {
    if (responseData) {
      delete responseData.json;
    }
  }

  function __send(ctx: Context): void {
    if (res.finished) {
      throw new Error('Response finished ?');
    }

    if (responseData === null) {
      throw new Error('No response sent !');
    }

    if (res.headersSent) {
      throw new Error('Header already sent !');
    }

    const headers: OutgoingHttpHeaders = {
      ...responseData.headers,
    };

    const isEmpty =
      HttpStatus.isEmpty(responseData.code) ||
      ctx.request.method === HttpMethod.HEAD ||
      ctx.request.method === HttpMethod.OPTIONS;

    const bodyStr = JSON.stringify(responseData.json);
    const length = Buffer.byteLength(bodyStr);

    // ignore body
    if (isEmpty === false) {
      headers[HttpHeaders.ContentLength] = length;
      headers[HttpHeaders.ContentType] = ContentType.Json;
    }

    res.writeHead(responseData.code, headers);

    if (isEmpty) {
      return res.end();
    }
    return res.end(bodyStr);
  }
}

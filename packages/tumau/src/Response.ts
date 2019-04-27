import http, { OutgoingHttpHeaders } from 'http';

export interface Response {
  res: http.ServerResponse;
  send(options?: SendOptions): void;
}

export const Response = {
  create: createResponse,
};

interface SendOptions {
  code?: number;
  json?: object;
  headers?: OutgoingHttpHeaders;
}

function createResponse(res: http.ServerResponse): Response {
  const response: Response = {
    res,
    send,
  };

  return response;

  function send(options: SendOptions = {}): void {
    const { code = 200, headers = {}, json = { enpty: true } } = options;

    const obj: OutgoingHttpHeaders = {};
    for (let k in headers) {
      obj[k.toLowerCase()] = headers[k];
    }

    const dataStr = JSON.stringify(json);

    obj['content-type'] = obj['content-type'] || res.getHeader('content-type') || 'application/json;charset=utf-8';
    obj['content-length'] = Buffer.byteLength(dataStr);

    res.writeHead(code, obj);
    res.end(dataStr);
  }
}

import { OutgoingHttpHeaders } from 'http';
import { HttpStatusCode } from './HttpStatus';

export interface Response {
  code: HttpStatusCode;
  body: string | null;
  headers: OutgoingHttpHeaders;
}

export const Response = {
  create: createResponse,
  withText: (text: string) => createResponse({ body: text }),
};

interface SendOptions {
  code?: HttpStatusCode;
  body?: string | null;
  headers?: OutgoingHttpHeaders;
}

function createResponse(options: SendOptions = {}): Response {
  const { code = 200, headers = {}, body = null } = options;

  const response: Response = {
    code,
    headers,
    body,
  };

  return response;
}

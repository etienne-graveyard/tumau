import { OutgoingHttpHeaders } from 'http';
import { HttpStatusCode } from './HttpStatus';

const IS_RESPONSE_TOKEN = Symbol('IS_RESPONSE_TOKEN');

export interface UnmarkResponse {
  code: HttpStatusCode;
  body: string | null;
  headers: OutgoingHttpHeaders;
}

export type Response<Res extends UnmarkResponse = UnmarkResponse> = UnmarkResponse & {
  [IS_RESPONSE_TOKEN]: true;
};

export const Response = {
  create: createResponse,
  withText: (text: string) => createResponse({ body: text }),
  isResponse,
  fromObject: markResponse,
};

interface SendOptions {
  code?: HttpStatusCode;
  body?: string | null;
  headers?: OutgoingHttpHeaders;
}

function markResponse<Res extends UnmarkResponse>(res: Res): Response<Res> {
  (res as any)[IS_RESPONSE_TOKEN] = true;
  return res as any;
}

function createResponse(options: SendOptions = {}): Response {
  const { code = 200, headers = {}, body = null } = options;

  const response: Response = {
    [IS_RESPONSE_TOKEN]: true,
    code,
    headers,
    body,
  };

  return response;
}

function isResponse(maybe: any): maybe is Response {
  return maybe && maybe[IS_RESPONSE_TOKEN] === true;
}

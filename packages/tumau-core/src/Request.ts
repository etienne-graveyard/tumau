import { IncomingMessage, IncomingHttpHeaders } from 'http';
import { HttpMethod } from './HttpMethod';
import { notNill } from './utils';

export interface Request {
  req: IncomingMessage;
  method: HttpMethod;
  url: string;
  headers: IncomingHttpHeaders;
}

export const Request = {
  create: createRequest,
};

async function createRequest(req: IncomingMessage): Promise<Request> {
  const url = notNill(req.url); // never null because IncomingMessage come from http.Server
  const method = notNill(req.method) as HttpMethod;

  const request: Request = {
    req,
    url,
    method,
    headers: req.headers,
  };

  return request;
}

import { IncomingMessage } from 'http';
import { HTTPMethod } from './HTTPMethod';
import { parse as parseQueryString, ParsedUrlQuery } from 'querystring';
import { StringDecoder } from 'string_decoder';
import { Middleware } from './Middleware';

export interface Request {
  req: IncomingMessage;
  method: HTTPMethod;
  query: null | ParsedUrlQuery;
  body: object;
  // raw url
  url: string;
  // parsed url
  search: null | string;
  href: string;
  path: string;
  pathname: string;
  rawQuery: null | string;
}

export interface ParsedUrl {
  _raw: string;
  query: null | string;
  search: null | string;
  href: string;
  path: string;
  pathname: string;
}

export const Request = {
  create: createRequest,
  parseUrl,
};

async function createRequest(req: IncomingMessage): Promise<Request> {
  const url = req.url!; // never null because IncomingMessage come from http.Server
  const parsed = parseUrl(url);
  const method = req.method! as HTTPMethod;

  // const route = router.find(method, parsed.pathname);
  // const notFound = route.middlewares.length === 0;

  const request: Request = {
    req,
    url,
    method,
    href: parsed.href,
    path: parsed.path,
    pathname: parsed.pathname,
    rawQuery: parsed.query,
    query: parsed.query ? parseQueryString(parsed.query) : null,
    search: parsed.search,
    body: {},
  };

  return request;
}

function parseUrl(url: string): ParsedUrl {
  const obj: ParsedUrl = {
    query: null,
    search: null,
    _raw: url,
    href: url,
    path: url,
    pathname: url,
  };

  let idx = url.indexOf('?', 1);
  if (idx !== -1) {
    const search = url.substring(idx);
    obj.search = search;
    obj.query = search.substring(1);
    obj.pathname = url.substring(0, idx);
  }
  return obj;
}

// =======================
// =======================
// =======================
// =======================
// =======================
// =======================
// =======================
// =======================
// =======================

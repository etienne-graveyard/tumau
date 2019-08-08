import { parse as parseQueryString, ParsedUrlQuery } from 'querystring';
import { BaseContext, Middleware } from '@tumau/core';

export interface ParsedUrl {
  query: null | ParsedUrlQuery;
  body: object;
  // parsed url
  search: null | string;
  href: string;
  path: string;
  pathname: string;
  rawQuery: null | string;
}

export interface UrlParserCtx extends BaseContext {
  parsedUrl?: ParsedUrl;
}

export function UrlParser<Ctx extends UrlParserCtx>(): Middleware<Ctx> {
  return (ctx, next) => {
    const parsed = parseUrl(ctx.request.url);
    const nextCtx: Ctx = {
      ...ctx,
      parsedUrl: {
        path: parsed.path,
        pathname: parsed.pathname,
        rawQuery: parsed.query,
        query: parsed.query ? parseQueryString(parsed.query) : null,
        search: parsed.search,
      },
    };
    return next(nextCtx);
  };
}

export interface ParsedUrlObj {
  query: null | string;
  search: null | string;
  href: string;
  path: string;
  pathname: string;
}

function parseUrl(url: string): ParsedUrlObj {
  const obj: ParsedUrlObj = {
    query: null,
    search: null,
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

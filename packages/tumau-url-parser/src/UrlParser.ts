import { parse as parseQueryString, ParsedUrlQuery } from 'querystring';
import { Middleware, Context, RequestConsumer } from '@tumau/core';

export interface ParsedUrl {
  query: null | ParsedUrlQuery;
  search: null | string;
  path: string;
  pathname: string;
  rawQuery: null | string;
}

export const UrlParserContext = Context.create<ParsedUrl>();

export const UrlParserConsumer = UrlParserContext.Consumer;

export function UrlParser(): Middleware {
  return (tools) => {
    if (tools.hasContext(UrlParserContext.Consumer)) {
      return tools.next();
    }
    const request = tools.readContextOrFail(RequestConsumer);
    const parsedObj = parseUrl(request.url);
    const parsed: ParsedUrl = {
      path: parsedObj.path,
      pathname: parsedObj.pathname,
      rawQuery: parsedObj.query,
      query: parsedObj.query ? parseQueryString(parsedObj.query) : null,
      search: parsedObj.search,
    };
    return tools.withContext(UrlParserContext.Provider(parsed)).next();
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

  const idx = url.indexOf('?', 1);
  if (idx !== -1) {
    const search = url.substring(idx);
    obj.search = search;
    obj.query = search.substring(1);
    obj.pathname = url.substring(0, idx);
  }
  return obj;
}

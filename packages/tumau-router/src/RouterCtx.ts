import { Middleware, BaseContext, HttpMethod } from '@tumau/core';
import { UrlParserCtx } from '@tumau/url-parser';

export interface Params {
  [key: string]: string;
}

interface RouterData {
  params: Params;
  middleware: Middleware<RouterCtx> | null;
  notFound: boolean;
  pattern: string;
}

export interface RouterCtx extends BaseContext, UrlParserCtx {
  router?: RouterData;
  routerAllowedMethods?: Set<HttpMethod>;
}

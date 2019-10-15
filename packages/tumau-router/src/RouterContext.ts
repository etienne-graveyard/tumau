import { Middleware, HttpMethod, Context } from '@tumau/core';

export interface Params {
  [key: string]: string;
}

export interface RouterContext {
  params: Params;
  middleware: Middleware | null;
  notFound: boolean;
  pattern: string;
}

export const RouterContext = Context.create<RouterContext>();
export const RouterAllowedMethodsContext = Context.create<Set<HttpMethod>>();

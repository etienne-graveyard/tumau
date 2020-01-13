import { Middleware, HttpMethod, Context } from '@tumau/core';
import { Chemin } from 'chemin';

export interface Params {
  [key: string]: string;
}

export interface RouterContext {
  params: Params;
  middleware: Middleware | null;
  notFound: boolean;
  pattern: Chemin | null;
  patterns: Array<Chemin>;
  get<P>(chemin: Chemin<P>): P | null;
  getOrFail<P>(chemin: Chemin<P>): P;
  has(chemin: Chemin): boolean;
}

export const RouterContext = Context.create<RouterContext>();
export const RouterConsumer = RouterContext.Consumer;

export const RouterAllowedMethodsContext = Context.create<Set<HttpMethod>>();
export const RouterAllowedMethodsConsumer = RouterAllowedMethodsContext.Consumer;

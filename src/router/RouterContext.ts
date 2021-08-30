import { HttpMethod, createContext } from '../core';
import { Chemin } from 'chemin';

export interface Params {
  [key: string]: unknown;
}

export interface RouterContext {
  params: Params;
  notFound: boolean;
  pattern: Chemin | null;
  get<P>(chemin: Chemin<P>): P | null;
  getOrFail<P>(chemin: Chemin<P>): P;
  has(chemin: Chemin): boolean;
}

export const RouterContext = createContext<RouterContext>({ name: 'Router' });
export const RouterConsumer = RouterContext.Consumer;

export const RouterAllowedMethodsContext = createContext<Set<HttpMethod>>({ name: 'RouterAllowedMethods' });
export const RouterAllowedMethodsConsumer = RouterAllowedMethodsContext.Consumer;

import * as Miid from 'miid';
import { TumauBaseResponse } from './TumauBaseResponse';

export type Result = TumauBaseResponse | null;
export type Middleware = Miid.Middleware<Result>;
export type Middlewares = Miid.Middlewares<Result>;

export function compose(...middleware: Array<Middleware | null>): Middleware {
  return Miid.compose(...middleware);
}

export function runMiddleware(middleware: Middleware, done: () => Result): Promise<Result> {
  return Miid.runMiddleware(middleware, done);
}

export function runMiddlewareWithContexts(
  middleware: Middleware,
  contexts: Array<Miid.ContextProvider<any>>,
  done: () => Result
): Promise<Result> {
  return Miid.runMiddlewareWithContexts(middleware, contexts, done);
}

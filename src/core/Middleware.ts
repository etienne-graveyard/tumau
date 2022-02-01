import * as Miid from 'miid';
import { TumauBaseResponse } from './TumauBaseResponse';

export type Context = Miid.Stack;
export type Result = TumauBaseResponse | null;
export type MaybeAsyncResult = Result | Promise<Result>;
export type Middleware = Miid.Middleware<Context, MaybeAsyncResult, Promise<Result>>;
export type Middlewares = Miid.Middlewares<Context, MaybeAsyncResult, Promise<Result>>;

export function compose(...middleware: Array<Middleware | null>): Middleware {
  return Miid.composeAdvanced<Context, MaybeAsyncResult, Promise<Result>>((res) => {
    return Promise.resolve(res);
  }, middleware);
}

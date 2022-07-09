import * as Miid from 'miid';
import { TumauContext } from '.';
import { TumauBaseResponse } from './TumauBaseResponse';

export type Result = TumauBaseResponse | null;
export type MaybeAsyncResult = Result | Promise<Result>;
export type Middleware = Miid.Middleware<TumauContext, MaybeAsyncResult, Promise<Result>>;
export type Middlewares = Miid.Middlewares<TumauContext, MaybeAsyncResult, Promise<Result>>;

export function compose(...middleware: Array<Middleware | null>): Middleware {
  return Miid.composeAdvanced<TumauContext, MaybeAsyncResult, Promise<Result>>((res) => {
    return Promise.resolve(res);
  }, middleware);
}

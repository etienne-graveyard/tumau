import * as Miid from 'miid';
import { TumauBaseResponse } from './TumauBaseResponse';

export type Result = TumauBaseResponse | null;
export type MaybeAsyncResult = Result | Promise<Result>;
export type Middleware = Miid.Middleware<MaybeAsyncResult>;
export type Middlewares = Miid.Middlewares<MaybeAsyncResult>;

export function compose(...middleware: Array<Middleware | null>): Middleware {
  return Miid.compose(...middleware);
}

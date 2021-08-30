import * as Miid from 'miid';
import { TumauBaseResponse } from './TumauBaseResponse';
export declare type Result = TumauBaseResponse | null;
export declare type MaybeAsyncResult = Result | Promise<Result>;
export declare type Middleware = Miid.Middleware<MaybeAsyncResult>;
export declare type Middlewares = Miid.Middlewares<MaybeAsyncResult>;
export declare function compose(...middleware: Array<Middleware | null>): Middleware;

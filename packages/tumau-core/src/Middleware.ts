import * as TumauMiddleware from '@tumau/middleware';
import { TumauResponse } from './TumauResponse';
import { ContextStack } from '@tumau/middleware/dist/Context';

export type Result = TumauResponse | null;
export type Middleware = TumauMiddleware.Middleware<Result>;
export type Middlewares = TumauMiddleware.Middlewares<Result>;
export type Tools = TumauMiddleware.Tools<Result>;
export type Done = TumauMiddleware.Done<Result>;

export const Tools = {
  getContext: (tools: Tools): ContextStack | null => TumauMiddleware.Tools.getContext(tools),
  getDone: (tools: Tools): Done => TumauMiddleware.Tools.getDone(tools),
  create: (context: ContextStack | null, done: Done): Tools => TumauMiddleware.Tools.create(context, done),
};

export const Middleware = {
  compose: (...middleware: Array<Middleware | null>): Middleware => TumauMiddleware.Middleware.compose(...middleware),
  run: (middleware: Middleware, done: () => Result): Promise<Result> =>
    TumauMiddleware.Middleware.run(middleware, done),
  provider: (
    first: TumauMiddleware.ContextProvider<any>,
    ...contexts: Array<TumauMiddleware.ContextProvider<any>>
  ): Middleware => TumauMiddleware.Middleware.provider(first, ...contexts),
};

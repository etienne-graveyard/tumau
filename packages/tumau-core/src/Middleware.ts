import * as Miid from 'miid';
import { TumauBaseResponse } from './TumauBaseResponse';

export type Result = TumauBaseResponse | null;
export type Middleware = Miid.Middleware<Result>;
export type Middlewares = Miid.Middlewares<Result>;
export type Tools = Miid.Tools<Result>;
export type Done = Miid.Done<Result>;

export const Tools = {
  getContext: (tools: Tools): Miid.ContextStack | null => Miid.Tools.getContext(tools),
  getDone: (tools: Tools): Done => Miid.Tools.getDone(tools),
  create: (context: Miid.ContextStack | null, done: Done): Tools => Miid.Tools.create(context, done),
};

export const Middleware = {
  compose: (...middleware: Array<Middleware | null>): Middleware => Miid.Middleware.compose(...middleware),
  run: (middleware: Middleware, done: () => Result): Promise<Result> => Miid.Middleware.run(middleware, done),
  runWithContexts: (
    middleware: Middleware,
    contexts: Array<Miid.ContextProvider<any>>,
    done: () => Result
  ): Promise<Result> => Miid.Middleware.runWithContexts(middleware, contexts, done),
  provider: (first: Miid.ContextProvider<any>, ...contexts: Array<Miid.ContextProvider<any>>): Middleware =>
    Miid.Middleware.provider(first, ...contexts),
};

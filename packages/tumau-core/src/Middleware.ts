import * as Miid from 'miid';
import { TumauBaseResponse } from './TumauBaseResponse';

export type Result = TumauBaseResponse | null;
export type Middleware = Miid.Middleware<Result>;
export type Middlewares = Miid.Middlewares<Result>;

export const Middleware = {
  compose: (...middleware: Array<Middleware | null>): Middleware => Miid.Middleware.compose(...middleware),
  run: (middleware: Middleware, done: () => Result): Promise<Result> => Miid.Middleware.run(middleware, done),
  runWithContexts: (
    middleware: Middleware,
    contexts: Array<Miid.ContextProvider<any>>,
    done: () => Result
  ): Promise<Result> => Miid.Middleware.runWithContexts(middleware, contexts, done),
};

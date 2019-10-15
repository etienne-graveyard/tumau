import { Response } from './Response';
import { Context } from './Context';

export type ResultSync = null | Response;
export type Result = ResultSync | Promise<ResultSync>;

export type Middleware = (ctx: Context, next: (nextCtx: Context) => Promise<ResultSync>) => Result;

export type Middlewares = Array<Middleware>;

export const Middleware = {
  compose,
};

function compose(...middlewares: Middlewares): Middleware {
  return async function(ctx, next): Promise<Response | null> {
    // last called middleware #
    let index = -1;
    return dispatch(0, ctx);
    async function dispatch(i: number, ctx: Context): Promise<Response | null> {
      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'));
      }
      index = i;
      const middle = middlewares[i];
      if (!middle) {
        return next(ctx);
      }
      const result = middle(ctx, nextCtx => {
        return dispatch(i + 1, nextCtx);
      });
      const res = await Promise.resolve<null | Response>(result);
      return res;
    }
  };
}

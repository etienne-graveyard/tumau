import { BaseContext } from './BaseContext';
import { Response } from './Response';

export interface Result<Ctx extends BaseContext> {
  ctx: Ctx;
  response: Response | null;
}

export type Next<Ctx extends BaseContext> = (nextCtx: Ctx) => Promise<Result<Ctx>>;

export type Middleware<Ctx extends BaseContext> = (ctx: Ctx, next: Next<Ctx>) => Promise<Result<Ctx>> | Result<Ctx>;

export type Middlewares<Ctx extends BaseContext> = Array<Middleware<Ctx>>;

export const Middleware = {
  compose,
};

function compose<Ctx extends BaseContext>(...middlewares: Middlewares<Ctx>): Middleware<Ctx> {
  return async function(inCtx, next): Promise<Result<Ctx>> {
    // last called middleware #
    let index = -1;
    return dispatch(0, inCtx);
    function dispatch(i: number, tmpCtx: Ctx): Promise<Result<Ctx>> {
      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'));
      }
      index = i;
      let fn = middlewares[i];
      if (i === middlewares.length) {
        fn = next;
      }
      if (!fn) {
        throw new Error('what ?');
      }
      try {
        return Promise.resolve(fn(tmpCtx, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}

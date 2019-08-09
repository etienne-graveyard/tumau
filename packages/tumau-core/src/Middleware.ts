import { BaseContext } from './BaseContext';
import { Response } from './Response';

export interface ResultResolved<Ctx extends BaseContext> {
  ctx: Ctx;
  response: Response | null;
}

export type ResultSync<Ctx extends BaseContext> = null | Response | ResultResolved<Ctx>;

export type Result<Ctx extends BaseContext> = null | Response | ResultResolved<Ctx> | Promise<ResultSync<Ctx>>;

export type Next<Ctx extends BaseContext> = (nextCtx: Ctx) => Promise<ResultResolved<Ctx>>;

export type Middleware<Ctx extends BaseContext> = (
  ctx: Ctx,
  next: Next<Ctx>
) => null | Response | ResultResolved<Ctx> | Promise<ResultSync<Ctx>>;

export type Middlewares<Ctx extends BaseContext> = Array<Middleware<Ctx>>;

export const Middleware = {
  compose,
  resolveResult,
};

function resolveResult<Ctx extends BaseContext>(
  prevCtx: Ctx,
  result: null | Response | ResultResolved<Ctx>
): ResultResolved<Ctx> {
  if (result === null) {
    return { ctx: prevCtx, response: null };
  }
  if (Response.isResponse(result)) {
    return { ctx: prevCtx, response: result };
  }
  return result;
}

function compose<Ctx extends BaseContext>(...middlewares: Middlewares<Ctx>): Middleware<Ctx> {
  return async function(inCtx, next): Promise<ResultResolved<Ctx>> {
    // last called middleware #
    let index = -1;
    return dispatch(0, inCtx);
    async function dispatch(i: number, tmpCtx: Ctx): Promise<ResultResolved<Ctx>> {
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
        const result: Result<Ctx> = fn(tmpCtx, dispatch.bind(null, i + 1));
        const res = await Promise.resolve<null | Response | ResultResolved<Ctx>>(result);
        return resolveResult(tmpCtx, res);
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}

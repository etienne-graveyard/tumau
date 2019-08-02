import { Context } from './Context';

export type Next = () => Promise<void>;

export type Middleware<Ctx extends Context = Context> = (ctx: Ctx, next: Next) => Promise<void> | void;

export type Middlewares<Ctx extends Context = Context> = Middleware<Ctx>[];

export const Middleware = {
  compose,
};

function compose<Ctx extends Context = Context>(...middlewares: Middlewares<Ctx>): Middleware<Ctx> {
  return async function(ctx, next): Promise<void> {
    // last called middleware #
    let index = -1;
    return dispatch(0);
    function dispatch(i: number): Promise<void> {
      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'));
      }
      index = i;
      let fn = middlewares[i];
      if (i === middlewares.length) {
        fn = next;
      }
      if (!fn) {
        return Promise.resolve();
      }
      try {
        return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}

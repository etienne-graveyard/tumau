import { Tools, Result, AsyncResult } from './Tools';
import { ContextProvider, ContextStack } from './Context';

export type Middleware<R> = (tools: Tools<R>) => Result<R>;
export type Middlewares<R> = Array<Middleware<R>>;

export const Middleware = {
  compose,
  run: runMiddleware,
  provider: createProviderMiddleware,
};

function runMiddleware<R>(middleware: Middleware<R>, done: () => Result<R>): AsyncResult<R> {
  return Promise.resolve(middleware(Tools.create(null, done)));
}

function compose<R>(...middlewares: Array<Middleware<R> | null>): Middleware<R> {
  const resolved: Array<Middleware<R>> = middlewares.filter((v: Middleware<R> | null): v is Middleware<R> => {
    return v !== null;
  });

  return async function(rootTools): Promise<R> {
    // last called middleware #
    return dispatch(0, Tools.getContext(rootTools));
    async function dispatch(i: number, context: ContextStack | null): Promise<R> {
      const middle = resolved[i];
      if (!middle) {
        return Tools.getDone(rootTools)(context);
      }
      const middleTools: Tools<R> = Tools.create(context, nextContext => {
        return dispatch(i + 1, nextContext);
      });
      const result = middle(middleTools);
      const res = await Promise.resolve<R>(result);
      // maybe we should validate that res is either null or an instance of TumauResponse
      return res;
    }
  };
}

function createProviderMiddleware<R>(
  first: ContextProvider<any>,
  ...contexts: Array<ContextProvider<any>>
): Middleware<R> {
  return tools => tools.withContext(first, ...contexts).next();
}

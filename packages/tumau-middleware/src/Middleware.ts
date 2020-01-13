import { Next, Result, createNext, AsyncResult } from './Next';
import { ContextProvider } from './Context';
import { ON_DONE, CONTEXT_TOKEN } from './constants';

export type Middleware<R> = (next: Next<R>) => Result<R>;
export type Middlewares<R> = Array<Middleware<R>>;

export const Middleware = {
  compose,
  run: runMiddleware,
  provider: createProviderMiddleware,
};

function runMiddleware<R>(middleware: Middleware<R>, done: () => Result<R>): AsyncResult<R> {
  return Promise.resolve(middleware(createNext(null, done)));
}

function compose<R>(...middlewares: Middlewares<R>): Middleware<R> {
  return async function(rootNext): Promise<R> {
    // last called middleware #
    return dispatch(0, rootNext);
    async function dispatch(i: number, next: Next<R>): Promise<R> {
      const middle = middlewares[i];
      if (!middle) {
        return rootNext[ON_DONE](next);
      }
      const middleNext: Next<R> = createNext<R>(next[CONTEXT_TOKEN], nextNext => {
        return dispatch(i + 1, nextNext);
      });
      const result = middle(middleNext);
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
  return next => next.set(first, ...contexts).run();
}

// const CONTEXT_TOKEN = Symbol('CONTEXT_TOKEN');

// export const Context = {
//   create: createContext,
// };

// export interface ContextConsumer<T, HasDefault extends boolean = boolean> {
//   [CONTEXT_TOKEN]: {
//     hasDefault: HasDefault;
//     defaultValue: T | undefined;
//   };
// }

// export interface ContextProvider<T, HasDefault extends boolean = boolean> {
//   [CONTEXT_TOKEN]: {
//     consumer: ContextConsumer<T, HasDefault>;
//     value: T;
//   };
// }

// export type ContextProviderFn<T, HasDefault extends boolean> = (value: T) => ContextProvider<T, HasDefault>;

// export interface ContextItem<T, HasDefault extends boolean = boolean> {
//   Consumer: ContextConsumer<T, HasDefault>;
//   Provider: ContextProviderFn<T, HasDefault>;
// }

// function createContext<T>(): ContextItem<T, false>;
// function createContext<T>(defaultValue: T): ContextItem<T, true>;
// function createContext<T>(defaultValue?: T): ContextItem<T, boolean> {
//   const Consumer: ContextConsumer<T, any> = {
//     [CONTEXT_TOKEN]: {
//       hasDefault: defaultValue !== undefined && arguments.length === 2,
//       defaultValue: defaultValue,
//     },
//   };
//   return {
//     Consumer,
//     Provider: value => ({ [CONTEXT_TOKEN]: { value, consumer: Consumer } }),
//   };
// }

// export interface ContextStack {
//   provider: ContextProvider<any>;
//   parent: null | ContextStack;
// }

// export const ContextStack = {
//   add(stack: ContextStack, ...items: Array<ContextProvider<any>>): ContextStack {
//     if (items.length === 0) {
//       return stack;
//     }
//     return [...items].reverse().reduce<ContextStack>((parent, provider) => {
//       return {
//         provider,
//         parent,
//       };
//     }, stack);
//   },

//   read(stack: ContextStack, ctx: ContextConsumer<any, any>): { found: boolean; value: any } {
//     if (stack.provider[CONTEXT_TOKEN].consumer === ctx) {
//       return {
//         found: true,
//         value: stack.provider[CONTEXT_TOKEN].value,
//       };
//     }
//     if (stack.parent === null) {
//       return {
//         found: false,
//         value: null,
//       };
//     }
//     return ContextStack.read(stack.parent, ctx);
//   },
//   create(first: ContextProvider<any>, ...items: Array<ContextProvider<any>>): ContextStack {
//     const root: ContextStack = { provider: first, parent: null };
//     return ContextStack.add(root, ...items);
//   },
// };

// export const ContextManager = {
//   create: createContextManager,
// };

// function debugStack(currentStack: ContextStack): Array<{ value: any; ctxId: string }> {
//   const idMap = new Map<any, string>();
//   const result: Array<{ value: any; ctxId: string }> = [];
//   const traverse = (stack: ContextStack) => {
//     let ctxId = idMap.get(stack.provider[CONTEXT_TOKEN].consumer);
//     if (ctxId === undefined) {
//       ctxId = Math.random()
//         .toString(36)
//         .substring(7);
//       idMap.set(stack.provider[CONTEXT_TOKEN].consumer, ctxId);
//     }
//     result.push({
//       ctxId,
//       value: stack.provider[CONTEXT_TOKEN].value,
//     });
//     if (stack.parent) {
//       traverse(stack.parent);
//     }
//   };
//   traverse(currentStack);
//   return result;
// }

// function createContextManager(currentStack: ContextStack): Context {
//   const manager: Context = {
//     set: (...contexts) => {
//       const nextStack = ContextStack.add(currentStack, ...contexts);
//       return createContextManager(nextStack);
//     },
//     get: ctx => {
//       const res = ContextStack.read(currentStack, ctx);
//       if (res.found === false) {
//         if (ctx[CONTEXT_TOKEN].hasDefault) {
//           return ctx[CONTEXT_TOKEN].defaultValue;
//         }
//         return null;
//       }
//       return res.value;
//     },
//     getOrThrow: ctx => {
//       const res = ContextStack.read(currentStack, ctx);
//       if (res.found === false) {
//         if (ctx[CONTEXT_TOKEN].hasDefault) {
//           return ctx[CONTEXT_TOKEN].defaultValue;
//         }
//         throw new Error(`Missing context ${ctx[CONTEXT_TOKEN]}`);
//       }
//       return res.value;
//     },
//     has: ctx => {
//       return ContextStack.read(currentStack, ctx).found;
//     },
//   };
//   (manager as any).__stack = currentStack;
//   (manager as any).debug = () => debugStack(currentStack);

//   return manager;
// }

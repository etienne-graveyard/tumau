import { Middleware } from './Middleware';

const CONTEXT_TOKEN = Symbol('CONTEXT_TOKEN');

export const Context = {
  create: createContext,
  createProviderMiddleware: createProviderMiddleware,
};

export interface ContextConsumer<T, HasDefault extends boolean = boolean> {
  [CONTEXT_TOKEN]: {
    hasDefault: HasDefault;
    defaultValue: T | undefined;
    name: string;
  };
}

export interface ContextProvider<T, HasDefault extends boolean = boolean> {
  [CONTEXT_TOKEN]: {
    consumer: ContextConsumer<T, HasDefault>;
    value: T;
  };
}

export type ContextProviderFn<T, HasDefault extends boolean> = (value: T) => ContextProvider<T, HasDefault>;

export interface ContextItem<T, HasDefault extends boolean = boolean> {
  Consumer: ContextConsumer<T, HasDefault>;
  Provider: ContextProviderFn<T, HasDefault>;
}

function createContext<T>(name: string): ContextItem<T, false>;
function createContext<T>(name: string, defaultValue: T): ContextItem<T, true>;
function createContext<T>(name: string, defaultValue?: T): ContextItem<T, boolean> {
  const Consumer: ContextConsumer<T, any> = {
    [CONTEXT_TOKEN]: {
      hasDefault: defaultValue !== undefined && arguments.length === 2,
      defaultValue: defaultValue,
      name,
    },
  };
  return {
    Consumer,
    Provider: value => ({ [CONTEXT_TOKEN]: { value, consumer: Consumer } }),
  };
}

export interface Context {
  set: (...contexts: Array<ContextProvider<any>>) => Context;
  get: <T, HasDefault extends boolean>(ctx: ContextConsumer<T, HasDefault>) => HasDefault extends true ? T : T | null;
  has: (ctx: ContextConsumer<any, any>) => boolean;
  getOrThrow: <T>(ctx: ContextConsumer<T>) => T;
}

export interface ContextStack {
  provider: ContextProvider<any>;
  parent: null | ContextStack;
}

export const ContextStack = {
  add(stack: ContextStack, ...items: Array<ContextProvider<any>>): ContextStack {
    if (items.length === 0) {
      return stack;
    }
    return [...items].reverse().reduce<ContextStack>((parent, provider) => {
      return {
        provider,
        parent,
      };
    }, stack);
  },

  read(stack: ContextStack, ctx: ContextConsumer<any, any>): { found: boolean; value: any } {
    if (stack.provider[CONTEXT_TOKEN].consumer === ctx) {
      return {
        found: true,
        value: stack.provider[CONTEXT_TOKEN].value,
      };
    }
    if (stack.parent === null) {
      return {
        found: false,
        value: null,
      };
    }
    return ContextStack.read(stack.parent, ctx);
  },
  create(first: ContextProvider<any>, ...items: Array<ContextProvider<any>>): ContextStack {
    const root: ContextStack = { provider: first, parent: null };
    return ContextStack.add(root, ...items);
  },
};

export const ContextManager = {
  create: createContextManager,
};

function debugStack(currentStack: ContextStack): Array<{ name: string; value: any; ctxId: string }> {
  const idMap = new Map<any, string>();
  const result: Array<{ name: string; value: any; ctxId: string }> = [];
  const traverse = (stack: ContextStack) => {
    let ctxId = idMap.get(stack.provider[CONTEXT_TOKEN].consumer);
    if (ctxId === undefined) {
      ctxId = Math.random()
        .toString(36)
        .substring(7);
      idMap.set(stack.provider[CONTEXT_TOKEN].consumer, ctxId);
    }
    result.push({
      ctxId,
      name: stack.provider[CONTEXT_TOKEN].consumer[CONTEXT_TOKEN].name,
      value: stack.provider[CONTEXT_TOKEN].value,
    });
    if (stack.parent) {
      traverse(stack.parent);
    }
  };
  traverse(currentStack);
  return result;
}

function createContextManager(currentStack: ContextStack): Context {
  const manager: Context = {
    set: (...contexts) => {
      const nextStack = ContextStack.add(currentStack, ...contexts);
      return createContextManager(nextStack);
    },
    get: ctx => {
      const res = ContextStack.read(currentStack, ctx);
      if (res.found === false) {
        if (ctx[CONTEXT_TOKEN].hasDefault) {
          return ctx[CONTEXT_TOKEN].defaultValue;
        }
        return null;
      }
      return res.value;
    },
    getOrThrow: ctx => {
      const res = ContextStack.read(currentStack, ctx);
      if (res.found === false) {
        if (ctx[CONTEXT_TOKEN].hasDefault) {
          return ctx[CONTEXT_TOKEN].defaultValue;
        }
        throw new Error(`Missing context ${ctx[CONTEXT_TOKEN].name}`);
      }
      return res.value;
    },
    has: ctx => {
      return ContextStack.read(currentStack, ctx).found;
    },
  };
  (manager as any).__stack = currentStack;
  (manager as any).debug = () => debugStack(currentStack);

  return manager;
}

function createProviderMiddleware(...contexts: Array<ContextProvider<any>>): Middleware {
  return (ctx, next) => next(ctx.set(...contexts));
}

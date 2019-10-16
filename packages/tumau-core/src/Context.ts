const CONTEXT_TOKEN = Symbol('CONTEXT_TOKEN');

export const Context = {
  create: createContext,
};

export interface ContextItem<T> {
  [CONTEXT_TOKEN]: {
    defaultValue: T | undefined;
    name: string;
  };
  provide(value: T): ProvidedContext<T>;
}

export interface ProvidedContext<T> {
  context: ContextItem<T>;
  value: T;
}

function createContext<T>(name: string, defaultValue?: T): ContextItem<T> {
  const ctx = {
    [CONTEXT_TOKEN]: {
      defaultValue,
      name,
    },
    provide: (value: T) => {
      return {
        context: ctx,
        value,
      };
    },
  };
  return ctx;
}

export interface Context {
  set: (...contexts: Array<ProvidedContext<any>>) => Context;
  get: <T>(ctx: ContextItem<T>) => T | null;
  has: <T>(ctx: ContextItem<T>) => boolean;
  getOrThrow: <T>(ctx: ContextItem<T | null | undefined>) => T;
}

export interface ContextStack {
  item: ProvidedContext<any>;
  parent: null | ContextStack;
}

export const ContextStack = {
  add(stack: ContextStack, ...items: Array<ProvidedContext<any>>): ContextStack {
    if (items.length === 0) {
      return stack;
    }
    return [...items].reverse().reduce<ContextStack>((parent, item) => {
      return {
        item,
        parent,
      };
    }, stack);
  },

  read(stack: ContextStack, ctx: ContextItem<any>): { found: boolean; value: any } {
    if (stack.item.context === ctx) {
      return {
        found: true,
        value: stack.item.value,
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
  create(first: ProvidedContext<any>, ...items: Array<ProvidedContext<any>>): ContextStack {
    const root = { item: first, parent: null };
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
    let ctxId = idMap.get(stack.item.context);
    if (ctxId === undefined) {
      ctxId = Math.random()
        .toString(36)
        .substring(7);
      idMap.set(stack.item.context, ctxId);
    }
    result.push({ ctxId, name: stack.item.context[CONTEXT_TOKEN].name, value: stack.item.value });
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
        return ctx[CONTEXT_TOKEN].defaultValue;
      }
      return res.value;
    },
    getOrThrow: ctx => {
      const res = ContextStack.read(currentStack, ctx);
      if (res.found === false) {
        throw new Error('Missing context');
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

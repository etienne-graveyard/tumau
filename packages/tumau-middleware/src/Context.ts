import { CONTEXT_TOKEN } from './constants';

export interface ContextConsumer<T, HasDefault extends boolean = boolean> {
  [CONTEXT_TOKEN]: {
    hasDefault: HasDefault;
    defaultValue: T | undefined;
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

export interface ContextStack {
  provider: ContextProvider<any>;
  parent: null | ContextStack;
}

export const Context = {
  create: createContext,
};

function createContext<T>(): ContextItem<T, false>;
function createContext<T>(defaultValue: T): ContextItem<T, true>;
function createContext<T>(defaultValue?: T): ContextItem<T, boolean> {
  const Consumer: ContextConsumer<T, any> = {
    [CONTEXT_TOKEN]: {
      hasDefault: defaultValue !== undefined && arguments.length === 2,
      defaultValue: defaultValue,
    },
  };
  return {
    Consumer,
    Provider: value => ({ [CONTEXT_TOKEN]: { value, consumer: Consumer } }),
  };
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

  read(stack: ContextStack | null, ctx: ContextConsumer<any, any>): { found: boolean; value: any } {
    if (stack === null) {
      return {
        found: false,
        value: null,
      };
    }
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

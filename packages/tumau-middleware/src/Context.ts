import { CONTEXT } from './constants';

export interface ContextConsumer<T, HasDefault extends boolean = boolean> {
  [CONTEXT]: {
    hasDefault: HasDefault;
    defaultValue: T | undefined;
  };
}

export interface ContextProvider<T, HasDefault extends boolean = boolean> {
  [CONTEXT]: {
    consumer: ContextConsumer<T, HasDefault>;
    value: T;
  };
}

export type ContextProviderFn<T, HasDefault extends boolean> = (value: T) => ContextProvider<T, HasDefault>;

// Expose both Provider & Consumer because this way you can expose only one of them
export interface Context<T, HasDefault extends boolean = boolean> {
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

function createContext<T>(): Context<T, false>;
function createContext<T>(defaultValue: T): Context<T, true>;
function createContext<T>(defaultValue?: T): Context<T, boolean> {
  const Consumer: ContextConsumer<T, any> = {
    [CONTEXT]: {
      hasDefault: defaultValue !== undefined && arguments.length === 2,
      defaultValue: defaultValue,
    },
  };
  return {
    Consumer,
    Provider: value => ({ [CONTEXT]: { value, consumer: Consumer } }),
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
    if (stack.provider[CONTEXT].consumer === ctx) {
      return {
        found: true,
        value: stack.provider[CONTEXT].value,
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
  create(...items: Array<ContextProvider<any>>): ContextStack | null {
    const [first, ...other] = items;
    if (!first) {
      return null;
    }
    const root: ContextStack = { provider: first, parent: null };
    return ContextStack.add(root, ...other);
  },
};

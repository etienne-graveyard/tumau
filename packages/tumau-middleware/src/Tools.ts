import { ContextStack, ContextProvider, ContextConsumer } from './Context';
import { CONTEXT, DONE, TUMAU_DEBUG } from './constants';

export type AsyncResult<R> = Promise<R>;
export type Result<R> = R | AsyncResult<R>;

export type Next<R> = () => AsyncResult<R>;
export type Done<R> = (content: ContextStack | null) => Result<R>;

export const Tools = {
  create: createTools,
  getContext: getToolsContext,
  getDone: getToolsDone,
};

export interface Tools<R> {
  [CONTEXT]: ContextStack | null;
  [DONE]: Done<R>;
  next: Next<R>;
  withContext: (first: ContextProvider<any>, ...contexts: Array<ContextProvider<any>>) => Tools<R>;
  hasContext: (ctx: ContextConsumer<any, any>) => boolean;
  readContext: <T, HasDefault extends boolean>(
    ctx: ContextConsumer<T, HasDefault>
  ) => HasDefault extends true ? T : T | null;
  readContextOrFail: <T>(ctx: ContextConsumer<T>) => T;
}

function getToolsContext<R>(tools: Tools<R>): ContextStack | null {
  return tools[CONTEXT];
}

function getToolsDone<R>(tools: Tools<R>): Done<R> {
  return tools[DONE];
}

function createTools<R>(context: ContextStack | null, done: Done<R>): Tools<R> {
  const tools: Tools<R> = {
    [CONTEXT]: context,
    [DONE]: done,
    next: () => Promise.resolve(done(context)),
    withContext: (first, ...contexts) => {
      const nextStack =
        context === null ? ContextStack.create(first, ...contexts) : ContextStack.add(context, first, ...contexts);
      return createTools(nextStack, done);
    },
    readContext: ctx => {
      const res = ContextStack.read(context, ctx);
      if (res.found === false) {
        if (ctx[CONTEXT].hasDefault) {
          return ctx[CONTEXT].defaultValue;
        }
        return null;
      }
      return res.value;
    },
    readContextOrFail: ctx => {
      const res = ContextStack.read(context, ctx);
      if (res.found === false) {
        if (ctx[CONTEXT].hasDefault) {
          return ctx[CONTEXT].defaultValue;
        }
        throw new Error(`Missing context`);
      }
      return res.value;
    },
    hasContext: ctx => {
      return ContextStack.read(context, ctx).found;
    },
  };

  (tools as any).debug = () => debugStack(context);
  return tools;
}

function debugStack(currentStack: ContextStack | null): Array<{ value: any; ctxId: string }> {
  const world: any = typeof window !== 'undefined' ? window : global;
  const idMap = world[TUMAU_DEBUG] || new Map<any, string>();
  if (!world[TUMAU_DEBUG]) {
    world[TUMAU_DEBUG] = idMap;
  }
  const result: Array<{ value: any; ctxId: string }> = [];
  const traverse = (stack: ContextStack | null) => {
    if (stack === null) {
      return;
    }
    let ctxId = idMap.get(stack.provider[CONTEXT].consumer);
    if (ctxId === undefined) {
      ctxId = Math.random()
        .toString(36)
        .substring(7);
      idMap.set(stack.provider[CONTEXT].consumer, ctxId);
    }
    result.push({
      ctxId,
      value: stack.provider[CONTEXT].value,
    });
    if (stack.parent) {
      traverse(stack.parent);
    }
  };
  traverse(currentStack);
  return result;
}

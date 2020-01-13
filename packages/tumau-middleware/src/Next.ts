import { ContextStack, ContextProvider, ContextConsumer } from './Context';
import { Middleware } from './Middleware';
import { CONTEXT_TOKEN, ON_DONE, TUMAU_DEBUG } from './constants';

export type AsyncResult<R> = Promise<R>;
export type Result<R> = R | AsyncResult<R>;

export type Run<R> = () => AsyncResult<R>;
export type NextInternal<R> = (contextStack: ContextStack | null) => AsyncResult<R>;

export interface Next<R> {
  [CONTEXT_TOKEN]: ContextStack | null;
  [ON_DONE]: Middleware<R>;
  run: Run<R>;
  set: (first: ContextProvider<any>, ...contexts: Array<ContextProvider<any>>) => Next<R>;
  get: <T, HasDefault extends boolean>(ctx: ContextConsumer<T, HasDefault>) => HasDefault extends true ? T : T | null;
  has: (ctx: ContextConsumer<any, any>) => boolean;
  getOrThrow: <T>(ctx: ContextConsumer<T>) => T;
}

export function createNext<R>(current: ContextStack | null, done: Middleware<R>): Next<R> {
  const next: Next<R> = {
    [CONTEXT_TOKEN]: current,
    [ON_DONE]: done,
    run: () => Promise.resolve(done(next)),
    set: (first, ...contexts) => {
      const nextStack =
        current === null ? ContextStack.create(first, ...contexts) : ContextStack.add(current, first, ...contexts);
      return createNext(nextStack, done);
    },
    get: ctx => {
      const res = ContextStack.read(current, ctx);
      if (res.found === false) {
        if (ctx[CONTEXT_TOKEN].hasDefault) {
          return ctx[CONTEXT_TOKEN].defaultValue;
        }
        return null;
      }
      return res.value;
    },
    getOrThrow: ctx => {
      const res = ContextStack.read(current, ctx);
      if (res.found === false) {
        if (ctx[CONTEXT_TOKEN].hasDefault) {
          return ctx[CONTEXT_TOKEN].defaultValue;
        }
        throw new Error(`Missing context ${ctx[CONTEXT_TOKEN]}`);
      }
      return res.value;
    },
    has: ctx => {
      return ContextStack.read(current, ctx).found;
    },
  };
  (next as any).debug = () => debugStack(current);

  return next;
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
    let ctxId = idMap.get(stack.provider[CONTEXT_TOKEN].consumer);
    if (ctxId === undefined) {
      ctxId = Math.random()
        .toString(36)
        .substring(7);
      idMap.set(stack.provider[CONTEXT_TOKEN].consumer, ctxId);
    }
    result.push({
      ctxId,
      value: stack.provider[CONTEXT_TOKEN].value,
    });
    if (stack.parent) {
      traverse(stack.parent);
    }
  };
  traverse(currentStack);
  return result;
}

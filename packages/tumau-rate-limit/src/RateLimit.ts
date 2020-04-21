import { HttpError } from '@tumau/core';
import { LimitStrategy } from './LimitStrategy';

export interface GlobalRateLimit<S> {
  hit: () => S;
}

export interface RateLimit<K, S> {
  hit: (val: K) => S;
}

export const RateLimit = {
  createByIp,
  createGlobal,
  create,
};

interface StoreState<S> {
  state: S;
  expireAt: number | null;
}

export interface RateLimitOptions<K, S> {
  errorMessage?: (key: K, state: S) => string;
  strategy: LimitStrategy<S>;
  storeCleanupSize?: number;
}

export interface GlobalRateLimitOptions<S> {
  errorMessage?: (state: S) => string;
  strategy: LimitStrategy<S>;
  storeCleanupSize?: number;
}

function create<K, S>(options: RateLimitOptions<K, S>): RateLimit<K, S> {
  const { strategy, storeCleanupSize = 500, errorMessage } = options;
  const store: Map<K, StoreState<S>> = new Map<K, StoreState<S>>();

  return {
    hit: (key) => {
      const now = Date.now();
      let prevState: StoreState<S> | undefined = store.get(key);
      if (prevState && prevState.expireAt !== null && prevState.expireAt < now) {
        prevState = undefined;
      }
      const { next: nextState, allowed, expireAt } = strategy(prevState ? prevState.state : undefined, now);
      store.set(key, { state: nextState, expireAt });
      if (store.size >= storeCleanupSize) {
        const keysToDelete: Array<K> = [];
        store.forEach((value, key) => {
          if (value.expireAt !== null && value.expireAt < now) {
            keysToDelete.push(key);
          }
        });
        keysToDelete.forEach((key) => {
          store.delete(key);
        });
      }
      if (!allowed) {
        const reason = errorMessage ? errorMessage(key, nextState) : undefined;
        throw new HttpError.TooManyRequests(reason);
      }
      return nextState;
    },
  };
}

function createGlobal<S>(options: GlobalRateLimitOptions<S>): GlobalRateLimit<S> {
  const { errorMessage, storeCleanupSize, strategy } = options;
  const limiter = create<null, S>({
    errorMessage: errorMessage ? (_key, state) => errorMessage(state) : undefined,
    storeCleanupSize,
    strategy,
  });
  return {
    hit: () => limiter.hit(null),
  };
}

function createByIp<S>(options: RateLimitOptions<string, S>): RateLimit<string, S> {
  const { errorMessage, storeCleanupSize, strategy } = options;
  return create({
    errorMessage: errorMessage || ((ip) => `too many request from ${ip}`),
    storeCleanupSize,
    strategy,
  });
}

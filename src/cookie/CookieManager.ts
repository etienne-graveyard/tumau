import { Middleware, createKey, Result, TumauResponse, HttpError, TumauHandlerResponse } from '../core';
import { LoggerConsumer } from '../logger';
import { CreateCookieOptions, SetCookie, SetCookies } from './Cookie';
import { CookieResponse } from './CookieResponse';

export interface CookieManager {
  set(name: string, value: string, options?: CreateCookieOptions): void;
  has(name: string): boolean;
  unset(name: string): void;
  delete(name: string, options?: CreateCookieOptions): void;
}

export const CookieManagerKey = createKey<CookieManager>({
  name: 'CookieManager',
});
export const CookieManagerConsumer = CookieManagerKey.Consumer;

export function CookieManager(): Middleware {
  return async (ctx, next): Promise<Result> => {
    const isUpgrade = ctx.isUpgrade;
    let cookies: SetCookies = [];
    const manager: CookieManager = {
      set: (name, value, options) => {
        cookies.push(SetCookie.create(name, value, options));
      },
      has: (name) => {
        const found = cookies.find((c) => c.name === name);
        return found !== undefined;
      },
      delete: (name, options) => {
        cookies.push(SetCookie.delete(name, options));
      },
      unset: (name) => {
        cookies = cookies.filter((c) => c.name !== name);
      },
    };
    const response = await next(ctx.with(CookieManagerKey.Provider(manager)));
    if (isUpgrade) {
      if (cookies.length) {
        const logger = ctx.get(LoggerConsumer);
        logger.warn(`Cookies set/deleted in an upgrade event are ignored`);
      }
      return response;
    }
    if (response === null) {
      // If the next did not respond we don't set cookies
      return null;
    }
    if (response instanceof TumauHandlerResponse) {
      return response;
    }
    if (response instanceof TumauResponse === false) {
      throw new HttpError.Internal(`CookieManager received an invalid response !`);
    }
    const res = response as TumauResponse;
    return CookieResponse.fromResponse(res, cookies);
  };
}

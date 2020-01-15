import { Middleware, Context, TumauResponse } from '@tumau/core';
import { CreateCookieOptions, SetCookie, SetCookies } from './Cookie';
import { CookieResponse } from './CookieResponse';

export interface CookieManager {
  set(name: string, value: string, options?: CreateCookieOptions): void;
  has(name: string): boolean;
  unset(name: string): void;
  delete(name: string): void;
}

export const CookieManagerCtx = Context.create<CookieManager>();
export const CookieManagerConsumer = CookieManagerCtx.Consumer;

/**
 *
 */
export function CookieManager(): Middleware {
  return async (tools): Promise<null | TumauResponse> => {
    let cookies: SetCookies = [];
    const manager: CookieManager = {
      set: (name, value, options) => {
        cookies.push(SetCookie.create(name, value, options));
      },
      has: name => {
        const found = cookies.find(c => c.name === name);
        return found !== undefined;
      },
      delete: name => {
        cookies.push(SetCookie.delete(name));
      },
      unset: name => {
        cookies = cookies.filter(c => c.name !== name);
      },
    };
    const response = await tools.withContext(CookieManagerCtx.Provider(manager)).next();
    if (response === null) {
      // If the next did not respond we don't set cookies
      // If you want to send cookies even when the server dis not respond
      // you can use the `HandleInvalidResponse` middleware
      return null;
    }
    return new CookieResponse(response, cookies);
  };
}

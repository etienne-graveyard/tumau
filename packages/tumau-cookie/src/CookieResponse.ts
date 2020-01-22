import { TumauResponse, HttpHeaders } from '@tumau/core';
import { SetCookies, SetCookie } from './Cookie';

export class CookieResponse extends TumauResponse {
  public originalResponse: TumauResponse;

  constructor(originalResponse: TumauResponse, cookies: SetCookies) {
    super(
      originalResponse.extends({
        headers: {
          [HttpHeaders.SetCookie]: CookieResponse.buildSetCookieHeader(cookies),
        },
      })
    );
    this.originalResponse = originalResponse;
  }

  public static buildSetCookieHeader(cookies: SetCookies): string | Array<string> | undefined {
    try {
      const all: { [name: string]: SetCookie } = {};
      cookies.forEach(c => {
        all[c.name] = c;
      });
      const names = Object.keys(all);
      if (names.length === 0) {
        return undefined;
      }
      if (names.length === 1) {
        const name = names[0];
        return SetCookie.toString(name, all[name]);
      }
      return names.map(name => SetCookie.toString(name, all[name]));
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  public static fromResponse(originalResponse: TumauResponse, cookies: SetCookies): TumauResponse | CookieResponse {
    if (cookies.length === 0) {
      return originalResponse;
    }
    return new CookieResponse(originalResponse, cookies);
  }
}

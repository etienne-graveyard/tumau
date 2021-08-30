import { Middleware, HttpHeaders, createContext, RequestConsumer, Result } from '../core';
import { Cookies } from './Cookie';

export const CookieParserContext = createContext<Cookies>({
  name: 'CookieParser',
  defaultValue: {},
});
export const CookieParserConsumer = CookieParserContext.Consumer;

export function CookieParser(): Middleware {
  return async (ctx, next): Promise<Result> => {
    const request = ctx.getOrFail(RequestConsumer);
    const headers = request.headers;

    const cookiesStr = headers[HttpHeaders.Cookie];
    const cookies = cookiesStr === undefined ? {} : Cookies.parse(cookiesStr);
    return next(ctx.with(CookieParserContext.Provider(cookies)));
  };
}

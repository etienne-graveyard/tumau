import { Middleware, HttpHeaders, Context, RequestConsumer, Result } from '@tumau/core';
import { Cookies } from './Cookie';

export const CookieParserContext = Context.create<Cookies>({});
export const CookieParserConsumer = CookieParserContext.Consumer;

export function CookieParser(): Middleware {
  return async (ctx, next): Promise<Result> => {
    const request = ctx.readContextOrFail(RequestConsumer);
    const headers = request.headers;

    const cookiesStr = headers[HttpHeaders.Cookie];
    const cookies = cookiesStr === undefined ? {} : Cookies.parse(cookiesStr);
    return next(ctx.withContext(CookieParserContext.Provider(cookies)));
  };
}

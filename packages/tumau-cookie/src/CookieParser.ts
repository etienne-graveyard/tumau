import { Middleware, HttpHeaders, Context, RequestConsumer, Result } from '@tumau/core';
import { Cookies } from './Cookie';

export const CookieParserContext = Context.create<Cookies>({});
export const CookieParserConsumer = CookieParserContext.Consumer;

export function CookieParser(): Middleware {
  return async (tools): Promise<Result> => {
    const request = tools.readContextOrFail(RequestConsumer);
    const headers = request.headers;

    const cookiesStr = headers[HttpHeaders.Cookie];
    const cookies = cookiesStr === undefined ? {} : Cookies.parse(cookiesStr);
    return tools.withContext(CookieParserContext.Provider(cookies)).next();
  };
}

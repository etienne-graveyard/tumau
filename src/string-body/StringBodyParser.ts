import { Middleware, HttpMethod, HttpHeader, HttpError, createKey, Result } from '../core';
import { parseStringBody } from './parseStringBody';

interface Options {
  // limit in byte
  limit?: number;
}

export const StringBodyKey = createKey<string | null>({ name: 'StringBody' });
export const StringBodyConsumer = StringBodyKey.Consumer;

export function StringBodyParser(options: Options = {}): Middleware {
  const _1mb = 1024 * 1024 * 1024;
  const { limit = _1mb } = options;

  return async (ctx, next): Promise<Result> => {
    const headers = ctx.headers;
    const noStringBodyCtx = ctx.with(StringBodyKey.Provider(null));

    if (ctx.method === HttpMethod.GET || ctx.method === HttpMethod.DELETE || ctx.method === HttpMethod.OPTIONS) {
      return next(noStringBodyCtx);
    }

    const contentType = headers[HttpHeader.ContentType];

    if (!contentType) {
      return next(noStringBodyCtx);
    }

    // const parsed = ContentType.parse(contentType);

    // TODO: do not parse body as text ??
    // if (STRING_CONTENT_TYPES.includes(parsed.type as any) === false) {
    //   return next(noStringBodyCtx);
    // }

    const length = (() => {
      const lengthStr = headers[HttpHeader.ContentLength];
      if (lengthStr === undefined || Array.isArray(lengthStr)) {
        return null;
      }
      const length = parseInt(lengthStr, 10);
      if (Number.isNaN(length)) {
        return null;
      }
      return length;
    })();

    if (length === 0) {
      return next(noStringBodyCtx);
    }

    if (length !== null && length > limit) {
      throw new HttpError.PayloadTooLarge();
    }
    const strBody = await parseStringBody(ctx.req, limit, length);
    return next(ctx.with(StringBodyKey.Provider(strBody)));
  };
}

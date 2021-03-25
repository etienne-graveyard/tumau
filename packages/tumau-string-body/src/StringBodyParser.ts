import {
  Middleware,
  HttpMethod,
  HttpHeaders,
  ContentType,
  HttpError,
  createContext,
  RequestConsumer,
  Result,
  ContentTypeUtils,
} from '@tumau/core';
import { parseStringBody } from './parseStringBody';

interface Options {
  // limit in byte
  limit?: number;
}

export const StringBodyContext = createContext<string | null>({ name: 'StringBody' });
export const StringBodyConsumer = StringBodyContext.Consumer;

const STRING_CONTENT_TYPES = [ContentType.Json, ContentType.Text, ContentType.Html, ContentType.GraphQL] as const;

export function StringBodyParser(options: Options = {}): Middleware {
  const _1mb = 1024 * 1024 * 1024;
  const { limit = _1mb } = options;

  return async (ctx, next): Promise<Result> => {
    const request = ctx.getOrFail(RequestConsumer);
    const headers = request.headers;
    const noStringBodyCtx = ctx.with(StringBodyContext.Provider(null));

    if (
      request.method === HttpMethod.GET ||
      request.method === HttpMethod.DELETE ||
      request.method === HttpMethod.OPTIONS
    ) {
      return next(noStringBodyCtx);
    }

    const contentType = headers[HttpHeaders.ContentType];

    if (!contentType) {
      return next(noStringBodyCtx);
    }

    const parsed = ContentTypeUtils.parse(contentType);

    if (STRING_CONTENT_TYPES.includes(parsed.type as any) === false) {
      return next(noStringBodyCtx);
    }

    const length = (() => {
      const lengthStr = headers[HttpHeaders.ContentLength];
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
    const strBody = await parseStringBody(request.req, limit, length);
    return next(ctx.with(StringBodyContext.Provider(strBody)));
  };
}

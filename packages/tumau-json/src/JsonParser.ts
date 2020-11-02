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
import { parseJsonBody } from './parseJsonBody';

interface Options {
  // limit in byte
  limit?: number;
}

export const JsonParserContext = createContext<any>();
export const JsonParserConsumer = JsonParserContext.Consumer;

export function JsonParser(options: Options = {}): Middleware {
  const _1mb = 1024 * 1024 * 1024;
  const { limit = _1mb } = options;

  return async (ctx, next): Promise<Result> => {
    const request = ctx.getOrFail(RequestConsumer);
    const headers = request.headers;
    const noBodyCtx = ctx.with(JsonParserContext.Provider(null));

    if (
      request.method === HttpMethod.GET ||
      request.method === HttpMethod.DELETE ||
      request.method === HttpMethod.OPTIONS
    ) {
      return next(noBodyCtx);
    }

    const contentType = headers[HttpHeaders.ContentType];

    if (!contentType) {
      return next(noBodyCtx);
    }

    const parsed = ContentTypeUtils.parse(contentType);

    if (parsed.type !== ContentType.Json) {
      return next(noBodyCtx);
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
      return next(noBodyCtx);
    }

    if (length !== null && length > limit) {
      throw new HttpError.PayloadTooLarge();
    }
    const jsonBody = await parseJsonBody(request.req, limit, length);
    return next(ctx.with(JsonParserContext.Provider(jsonBody)));
  };
}

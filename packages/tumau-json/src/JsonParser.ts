import {
  Middleware,
  HttpMethod,
  HttpHeaders,
  ContentType,
  HttpError,
  Context,
  Response,
  RequestContext,
} from '@tumau/core';
import { parseJsonBody } from './parseJsonBody';

interface Options {
  // limit in byte
  limit?: number;
}

export const JsonParserContext = Context.create<object | null>();

export function JsonParser(options: Options = {}): Middleware {
  const _1mb = 1024 * 1024 * 1024;
  const { limit = _1mb } = options;

  return async (ctx, next): Promise<null | Response> => {
    const request = ctx.getOrThrow(RequestContext);
    const headers = request.headers;
    const noBodyNextCtx = ctx.set(JsonParserContext.provide(null));

    if (
      request.method === HttpMethod.GET ||
      request.method === HttpMethod.DELETE ||
      request.method === HttpMethod.OPTIONS
    ) {
      return next(noBodyNextCtx);
    }

    const contentType = headers[HttpHeaders.ContentType];
    if (contentType !== ContentType.Json) {
      return next(noBodyNextCtx);
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
      return next(noBodyNextCtx);
    }

    if (length !== null && length > limit) {
      throw new HttpError.PayloadTooLarge();
    }
    const jsonBody = await parseJsonBody(request.req, limit, length);
    return next(ctx.set(JsonParserContext.provide(jsonBody)));
  };
}

import { Middleware, HttpMethod, HttpHeaders, ContentType, HttpError, BaseContext, ResultSync } from '@tumau/core';
import { parseJsonBody } from './parseJsonBody';

interface Options {
  // limit in byte
  limit?: number;
}

export interface JsonParserCtx extends BaseContext {
  jsonBody?: object | null;
}

export function JsonParser<Ctx extends JsonParserCtx>(options: Options = {}): Middleware<Ctx> {
  const _1mb = 1024 * 1024 * 1024;
  const { limit = _1mb } = options;

  return async (ctx, next): Promise<ResultSync<Ctx>> => {
    const headers = ctx.request.headers;
    const noBodyNextCtx = {
      ...ctx,
      jsonBody: null,
    };

    if (
      ctx.request.method === HttpMethod.GET ||
      ctx.request.method === HttpMethod.DELETE ||
      ctx.request.method === HttpMethod.OPTIONS
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
    const jsonBody = await parseJsonBody(ctx.request.req, limit, length);
    return next({
      ...ctx,
      jsonBody,
    });
  };
}

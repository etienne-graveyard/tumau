import {
  Middleware,
  HttpMethod,
  HttpHeaders,
  ContentType,
  HttpError,
  Context,
  RequestConsumer,
  Result,
} from '@tumau/core';
import { parseJsonBody } from './parseJsonBody';

interface Options {
  // limit in byte
  limit?: number;
}

export const JsonParserContext = Context.create<any>();
export const JsonParserConsumer = JsonParserContext.Consumer;

export function JsonParser(options: Options = {}): Middleware {
  const _1mb = 1024 * 1024 * 1024;
  const { limit = _1mb } = options;

  return async (tools): Promise<Result> => {
    const request = tools.readContextOrFail(RequestConsumer);
    const headers = request.headers;
    const noBodyTools = tools.withContext(JsonParserContext.Provider(null));

    if (
      request.method === HttpMethod.GET ||
      request.method === HttpMethod.DELETE ||
      request.method === HttpMethod.OPTIONS
    ) {
      return noBodyTools.next();
    }

    const contentType = headers[HttpHeaders.ContentType];

    if (contentType !== ContentType.Json) {
      return noBodyTools.next();
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
      return noBodyTools.next();
    }

    if (length !== null && length > limit) {
      throw new HttpError.PayloadTooLarge();
    }
    const jsonBody = await parseJsonBody(request.req, limit, length);
    return tools.withContext(JsonParserContext.Provider(jsonBody)).next();
  };
}

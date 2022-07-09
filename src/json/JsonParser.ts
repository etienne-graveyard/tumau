import { ContentType, MimeType } from '../content-type';
import { Middleware, HttpMethod, HttpHeader, HttpError, createKey, Result } from '../core';
import { StringBodyConsumer } from '../string-body';

// Allowed whitespace is defined in RFC 7159
// http://www.rfc-editor.org/rfc/rfc7159.txt
// eslint-disable-next-line no-control-regex
const strictJSONReg = /^[\x20\x09\x0a\x0d]*(\[|\{)/;

export const JsonParserKey = createKey<any>({ name: 'JsonParser' });
export const JsonParserConsumer = JsonParserKey.Consumer;

export function JsonParser(): Middleware {
  return async (ctx, next): Promise<Result> => {
    const headers = ctx.headers;
    const noBodyCtx = ctx.with(JsonParserKey.Provider(null));

    if (ctx.method === HttpMethod.GET || ctx.method === HttpMethod.DELETE || ctx.method === HttpMethod.OPTIONS) {
      return next(noBodyCtx);
    }

    const contentType = headers[HttpHeader.ContentType];

    if (!contentType) {
      return next(noBodyCtx);
    }

    const parsedContentType = ContentType.parse(contentType);
    const stringContent = ctx.get(StringBodyConsumer);
    const isJsonContentType = parsedContentType.type === MimeType.fromExtension('json');

    if (stringContent === null || stringContent.length === 0 || !isJsonContentType) {
      return next(noBodyCtx);
    }

    // strict JSON test
    if (!strictJSONReg.test(stringContent)) {
      throw new HttpError.NotAcceptable('invalid JSON, only supports object and array');
    }
    const jsonBody = JSON.parse(stringContent);
    return next(ctx.with(JsonParserKey.Provider(jsonBody)));
  };
}

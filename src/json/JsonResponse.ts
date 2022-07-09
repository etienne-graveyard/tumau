import { TumauResponse, HttpStatusCode, HttpError, createKey } from '../core';
import { ContentType, ContentTypeCharset } from '../content-type';
import { HttpResponseHeader, HttpResponseHeaders } from '../core/HttpHeaders';

interface Options {
  code?: HttpStatusCode;
  headers?: HttpResponseHeaders;
}

const JsonResponseKey = createKey<unknown>({ name: 'JsonResponse' });

export const JsonResponse = {
  create<T>(content: T, options: Options = {}): TumauResponse {
    const { code = 200, headers = [] } = options;
    const body = JSON.stringify(content);
    const outHeaders: HttpResponseHeaders = [
      ...headers,
      [HttpResponseHeader.ContentType, ContentType.format('json', { charset: ContentTypeCharset.Utf8 })],
      [HttpResponseHeader.ContentLength, Buffer.byteLength(body, 'utf8').toFixed()],
    ];
    return TumauResponse.create({
      code,
      headers: outHeaders,
      body,
    }).with(JsonResponseKey.Provider(content));
  },
  fromError(err: unknown, debug: boolean): TumauResponse {
    if (err instanceof HttpError) {
      const stack = (err instanceof HttpError.Internal ? err.internalStack : err.stack) || '';
      return JsonResponse.create(
        {
          code: err.code,
          message: err.message,
          ...(debug ? { stack } : {}),
        },
        { code: err.code }
      );
    }
    if (err instanceof Error) {
      return JsonResponse.fromError(new HttpError.Internal(err.message, err.stack), debug);
    }
    return JsonResponse.fromError(new HttpError.Internal(String(err)), debug);
  },
  // fromResponse(res: unknown, debug: boolean): TumauResponse {
  //   if (res === null) {
  //     return JsonResponse.fromError(new HttpError.ServerDidNotRespond(), debug);
  //   }
  //   if (res instanceof HttpError || res instanceof Error) {
  //     return JsonResponse.fromError(res, debug);
  //   }
  //   if (res instanceof TumauResponse) {
  //     const hasJson = res.has(JsonResponseKey.Consumer);
  //     if (hasJson) {
  //       return res;
  //     }
  //     if (HttpStatus.isEmpty(res.status)) {
  //       // No content are OK
  //       return tumauRes;
  //     }
  //     const isJson = tumauRes.headers[HttpHeaders.ContentType] === ContentType.Json;
  //     if (isJson) {
  //       return res;
  //     }
  //     // try to convert to JSON
  //     const body = tumauRes.body;
  //     if (body === null) {
  //       return new JsonResponse({
  //         code: tumauRes.code,
  //         headers: { ...tumauRes.headers },
  //         json: {},
  //       });
  //     }
  //     if (typeof body === 'string') {
  //       return new JsonResponse({
  //         code: tumauRes.code,
  //         headers: { ...tumauRes.headers },
  //         json: body,
  //       });
  //     }
  //     // failed to convert, throw error
  //     return JsonResponse.fromError(
  //       new HttpError.Internal(`Invalid response: Expected a JsonResponse got a TumauResponse`),
  //       debug
  //     );
  //   }
  //   return JsonResponse.fromError(new HttpError.Internal(`Invalid response: Expected a JsonResponse`), debug);
  // },
};

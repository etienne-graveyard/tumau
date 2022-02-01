import { TumauResponse, HttpStatusCode, HttpHeaders, HttpError, HttpStatus } from '../core';
import { OutgoingHttpHeaders } from 'http';
import { ContentType } from '../content-type';

interface Options<T> {
  json: T;
  code?: HttpStatusCode;
  headers?: OutgoingHttpHeaders;
}

export class JsonResponse<T = any> extends TumauResponse {
  public json: any;

  public constructor(options: Options<T>) {
    const { code = 200, headers = {}, json } = options;
    const body = JSON.stringify(json);
    const outHeaders: OutgoingHttpHeaders = {
      ...headers,
      [HttpHeaders.ContentType]: ContentType.Json,
      [HttpHeaders.ContentLength]: Buffer.byteLength(body, 'utf8'),
    };
    super({ code, headers: outHeaders, body });
    this.json = json;
  }

  public static withJson<T>(json: T): JsonResponse {
    return new JsonResponse({ json });
  }

  public static fromError(err: unknown, debug: boolean): JsonResponse {
    if (err instanceof HttpError) {
      const stack = (err instanceof HttpError.Internal ? err.internalStack : err.stack) || '';
      return new JsonResponse({
        code: err.code,
        json: {
          code: err.code,
          message: err.message,
          ...(debug ? { stack } : {}),
        },
      });
    }
    if (err instanceof Error) {
      return JsonResponse.fromError(new HttpError.Internal(err.message, err.stack), debug);
    }
    return JsonResponse.fromError(new HttpError.Internal(String(err)), debug);
  }

  public static fromResponse(res: unknown, debug: boolean): JsonResponse | TumauResponse {
    if (res === null) {
      return JsonResponse.fromError(new HttpError.ServerDidNotRespond(), debug);
    }
    if (res instanceof HttpError || res instanceof Error) {
      return JsonResponse.fromError(res, debug);
    }
    if (res instanceof TumauResponse) {
      if (res instanceof JsonResponse) {
        return res;
      }
      const tumauRes = res as TumauResponse;
      if (HttpStatus.isEmpty(tumauRes.code)) {
        // No content are OK
        return tumauRes;
      }
      const isJson = tumauRes.headers[HttpHeaders.ContentType] === ContentType.Json;
      if (isJson) {
        return res;
      }
      // try to convert to JSON
      const body = tumauRes.body;
      if (body === null) {
        return new JsonResponse({
          code: tumauRes.code,
          headers: { ...tumauRes.headers },
          json: {},
        });
      }
      if (typeof body === 'string') {
        return new JsonResponse({
          code: tumauRes.code,
          headers: { ...tumauRes.headers },
          json: body,
        });
      }
      // failed to convert, throw error
      return JsonResponse.fromError(
        new HttpError.Internal(`Invalid response: Expected a JsonResponse got a TumauResponse`),
        debug
      );
    }
    return JsonResponse.fromError(new HttpError.Internal(`Invalid response: Expected a JsonResponse`), debug);
  }
}

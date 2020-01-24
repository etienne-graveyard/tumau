import { TumauResponse, HttpStatusCode, HttpHeaders, ContentType, HttpError, HttpStatus } from '@tumau/core';
import { OutgoingHttpHeaders } from 'http';

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

  public static with<T extends object>(json: T): JsonResponse {
    return new JsonResponse({ json });
  }

  public static fromError(err: any): JsonResponse {
    if (err instanceof HttpError) {
      return new JsonResponse({
        code: err.code,
        json: {
          code: err.code,
          message: err.message,
        },
      });
    }
    if (err instanceof Error) {
      return JsonResponse.fromError(new HttpError.Internal(err.message));
    }
    return JsonResponse.fromError(new HttpError.Internal(String(err.message)));
  }

  public static fromResponse(res: any): JsonResponse | TumauResponse {
    if (res === null) {
      return JsonResponse.fromError(new HttpError.ServerDidNotRespond());
    }
    if (res instanceof HttpError || res instanceof Error) {
      return JsonResponse.fromError(res);
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
        new HttpError.Internal(`Invalid response: Expected a JsonResponse got a TumauResponse`)
      );
    }
    return JsonResponse.fromError(new HttpError.Internal(`Invalid response: Expected a JsonResponse`));
  }
}

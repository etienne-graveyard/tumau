import { TumauResponse, HttpStatusCode, HttpHeaders, ContentType, HttpError } from '@tumau/core';
import { OutgoingHttpHeaders } from 'http';

interface Options<T extends object> {
  json: T;
  code?: HttpStatusCode;
  headers?: OutgoingHttpHeaders;
}

export class JsonResponse<T extends object = object> extends TumauResponse {
  public json: object;

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

  public static fromResponse(res: any): JsonResponse {
    if (res instanceof JsonResponse) {
      return res;
    }
    if (res === null) {
      return JsonResponse.fromError(new HttpError.ServerDidNotRespond());
    }
    if (res instanceof HttpError || res instanceof Error) {
      return JsonResponse.fromError(res);
    }
    if (res instanceof TumauResponse) {
      return JsonResponse.fromError(
        new HttpError.Internal(`Invalid response: Expected a JsonResponse got a TumauResponse`)
      );
    }
    return JsonResponse.fromError(new HttpError.Internal(`Invalid response: Expected a JsonResponse`));
  }
}

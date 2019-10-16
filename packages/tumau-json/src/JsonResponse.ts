import { TumauResponse, HttpStatusCode, HttpHeaders, ContentType, HttpError } from '@tumau/core';
import { OutgoingHttpHeaders } from 'http';

interface Options {
  json: object;
  code?: HttpStatusCode;
  headers?: OutgoingHttpHeaders;
}

export class JsonResponse extends TumauResponse {
  public json: object;

  public constructor(options: Options) {
    const { code = 200, headers = {}, json } = options;
    const body = JSON.stringify(json);
    const outHeaders: OutgoingHttpHeaders = {
      ...headers,
      [HttpHeaders.ContentType]: ContentType.Json,
      [HttpHeaders.ContentLength]: body.length,
    };
    super({ code, headers: outHeaders, body });
    this.json = json;
  }

  public static with(json: object): JsonResponse {
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
}

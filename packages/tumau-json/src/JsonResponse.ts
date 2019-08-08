import { Response, UnmarkResponse, HttpStatusCode, HttpHeaders, ContentType } from '@tumau/core';
import { OutgoingHttpHeaders } from 'http';

export const JsonResponse = {
  create: createJsonResponse,
};

export interface UnmarkJsonResponse extends UnmarkResponse {
  json: object;
}

export type JsonResponse = Response<UnmarkJsonResponse>;

interface Options {
  json: object;
  code?: HttpStatusCode;
  headers?: OutgoingHttpHeaders;
}

function createJsonResponse(options: Options): JsonResponse {
  const { code = 200, headers = {}, json } = options;

  const body = JSON.stringify(json);

  const response: JsonResponse = Response.fromObject<UnmarkJsonResponse>({
    code,
    headers: {
      ...headers,
      [HttpHeaders.ContentType]: ContentType.Json,
      [HttpHeaders.ContentEncoding]: ContentType.Json,
      [HttpHeaders.ContentLength]: body.length,
    },
    body,
    json,
  });

  return response;
}

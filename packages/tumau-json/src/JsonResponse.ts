import { Response, HttpStatusCode, HttpHeaders, ContentType } from '@tumau/core';
import { OutgoingHttpHeaders } from 'http';

export const JsonResponse = {
  create: createJsonResponse,
};

export interface JsonResponse extends Response {
  json: object;
}

interface Options {
  json: object;
  code?: HttpStatusCode;
  headers?: OutgoingHttpHeaders;
}

function createJsonResponse(options: Options): JsonResponse {
  const { code = 200, headers = {}, json } = options;

  const body = JSON.stringify(json);

  const response: JsonResponse = {
    code,
    headers: {
      ...headers,
      [HttpHeaders.ContentType]: ContentType.Json,
      [HttpHeaders.ContentEncoding]: ContentType.Json,
      [HttpHeaders.ContentLength]: body.length,
    },
    body,
    json,
  };

  return response;
}

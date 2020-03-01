import { Middleware, ErrorToHttpError, InvalidResponseToHttpError } from '@tumau/core';
import { HttpErrorToJson } from './HttpErrorToJson';
import { JsonParser } from './JsonParser';

interface Options {
  // limit in byte
  limit?: number;
}

export function JsonPackage(options: Options = {}): Middleware {
  return Middleware.compose(
    HttpErrorToJson,
    ErrorToHttpError,
    InvalidResponseToHttpError,
    JsonParser(options) // parse json body
  );
}

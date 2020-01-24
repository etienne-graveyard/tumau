import { Middleware } from '@tumau/core';
import { EnsureJsonResponse } from './EnsureJsonResponse';
import { JsonParser } from './JsonParser';

interface Options {
  // limit in byte
  limit?: number;
}

export function JsonPackage(options: Options = {}): Middleware {
  return Middleware.compose(
    EnsureJsonResponse, // if the response is not Json convert it to json
    JsonParser(options) // parse json body
  );
}

import { Middleware } from '@tumau/core';
import { JsonParser } from './JsonParser';
import { ErrorToJson } from './ErrorToJson';

interface Options {
  // limit in byte
  limit?: number;
}

export function JsonPackage(options: Options = {}): Middleware {
  return Middleware.compose(
    JsonParser(options),
    ErrorToJson
  );
}

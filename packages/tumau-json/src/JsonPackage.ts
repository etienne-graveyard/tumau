import { Middleware, HandleInvalidResponse, HandleErrors } from '@tumau/core';
import { JsonParser } from './JsonParser';
import { ErrorToJson } from './ErrorToJson';

interface Options {
  // limit in byte
  limit?: number;
}

export function JsonPackage(options: Options = {}): Middleware {
  return Middleware.compose(
    ErrorToJson, // 3. if the response is an HttpError convert it to json
    HandleErrors, // 2. if an error occure catch it and return an HttpError
    HandleInvalidResponse, // 1. make sure the rerver respond
    JsonParser(options) // parse json body
  );
}

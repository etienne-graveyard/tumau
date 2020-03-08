import { Middleware, RequestConsumer, TumauResponse, HttpError } from '@tumau/core';
import { CorsActualResponse } from './CorsActualResponse';
import { createOriginMatcher } from './utils';

export interface CorsActualConfig {
  allowOrigin?: Array<string | RegExp>;
  allowCredentials?: boolean;
  exposeHeaders?: Array<string> | null;

  // allowMethods?: ValOrFn<Set<HttpMethod> | null>;
  // allowHeaders?: ValOrFn<Set<string> | null>;
  // maxAge?: ValOrFn<number | null>;
}

// const DEFAULT_ALLOW_METHODS = new Set([
//   HttpMethod.GET,
//   HttpMethod.HEAD,
//   HttpMethod.PUT,
//   HttpMethod.POST,
//   HttpMethod.DELETE,
//   HttpMethod.PATCH,
// ]);

export function CorsActual(config: CorsActualConfig = {}): Middleware {
  const { allowOrigin = ['*'], allowCredentials = false, exposeHeaders = null } = config;

  if (allowOrigin.indexOf('*') >= 0 && allowCredentials === true) {
    throw new Error(`credentials not supported with wildcard`);
  }

  const originMatcher = createOriginMatcher(allowOrigin);

  return async tools => {
    const request = tools.readContextOrFail(RequestConsumer);
    const origin = request.origin;

    const response = await tools.next();

    if (request.isUpgrade) {
      return response;
    }
    if (response instanceof TumauResponse === false) {
      throw new HttpError.Internal(`Cors received an invalid response !`);
    }
    // If either no origin was set, or the origin isn't supported, continue
    // without setting any headers
    if (!origin || !originMatcher(origin)) {
      return response;
    }
    const res = response as TumauResponse | null;

    return CorsActualResponse.fromResponse(res, {
      allowOrigin: origin,
      allowCredentials,
      exposeHeaders,
    });
  };
}

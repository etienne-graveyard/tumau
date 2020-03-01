import { Middleware, RequestConsumer, HttpMethod, HttpHeaders } from '@tumau/core';
import { CorsPreflightResponse } from './CorsPreflightResponse';
import { createOriginMatcher } from './utils';

export interface CorsPreflightConfig {
  allowOrigin?: Array<string | RegExp>;
  allowCredentials?: boolean;
  exposeHeaders?: Array<string> | null;
  allowHeaders?: Array<string> | null;
  maxAge?: number | null;
}

// const DEFAULT_ALLOW_METHODS = new Set([
//   HttpMethod.GET,
//   HttpMethod.HEAD,
//   HttpMethod.PUT,
//   HttpMethod.POST,
//   HttpMethod.DELETE,
//   HttpMethod.PATCH,
// ]);

export function CorsPreflight(config: CorsPreflightConfig = {}): Middleware {
  const {
    allowOrigin = ['*'],
    allowCredentials = false,
    exposeHeaders = null,
    allowHeaders = null,
    maxAge = null,
  } = config;

  if (allowOrigin.indexOf('*') >= 0 && allowCredentials === true) {
    throw new Error(`credentials not supported with wildcard`);
  }

  const originMatcher = createOriginMatcher(allowOrigin);

  return async tools => {
    const request = tools.readContextOrFail(RequestConsumer);
    const origin = request.origin;

    if (request.method !== HttpMethod.OPTIONS) {
      return tools.next();
    }

    if (!origin || !originMatcher(origin)) {
      return tools.next();
    }

    const requestMethod = request.headers[HttpHeaders.AccessControlRequestMethod] as string | undefined;
    if (!requestMethod) {
      tools.next();
    }

    const allowMethods = [requestMethod as HttpMethod, HttpMethod.OPTIONS];

    return new CorsPreflightResponse({
      allowOrigin: origin,
      allowCredentials: true,
      allowHeaders,
      allowMethods,
      exposeHeaders,
      maxAge,
    });
  };
}

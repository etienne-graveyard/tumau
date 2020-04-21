import { Middleware, RequestConsumer, HttpMethod, HttpHeaders } from '@tumau/core';
import { CorsPreflightResponse } from './CorsPreflightResponse';
import { createPreflightConfigResolver, CorsPreflightConfig } from './utils';
import { DEFAULT_ALLOW_ORIGIN, DEFAULT_ALLOW_CREDENTIALS } from './defaults';

export function CorsPreflight(config: CorsPreflightConfig = {}): Middleware {
  const { allowOrigin = DEFAULT_ALLOW_ORIGIN, allowCredentials = DEFAULT_ALLOW_CREDENTIALS } = config;

  if (allowOrigin.indexOf('*') >= 0 && allowCredentials === true) {
    throw new Error(`credentials not supported with wildcard`);
  }

  const resolver = createPreflightConfigResolver(config);

  return async (tools) => {
    const request = tools.readContextOrFail(RequestConsumer);
    const origin = request.origin;

    // Preflight only on OPTION
    if (request.method !== HttpMethod.OPTIONS) {
      return tools.next();
    }

    // The requested method
    const requestMethod = request.headers[HttpHeaders.AccessControlRequestMethod] as string | undefined;
    // If there are no Access-Control-Request-Method this is not CORS preflight
    if (!requestMethod) {
      return tools.next();
    }

    const cors = resolver(origin);
    if (cors === false) {
      return tools.next();
    }

    // At this point we know the request is a CORS Preflight
    // We don't call the next middleware and return a CorsPreflightResponse
    return new CorsPreflightResponse(cors);
  };
}

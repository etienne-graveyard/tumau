import { Middleware, HttpHeader } from '../core';
import { CorsPreflightResponse } from './CorsPreflightResponse';
import { createPreflightConfigResolver, CorsPreflightConfig } from './utils';

export function CorsPreflight(config: CorsPreflightConfig = {}): Middleware {
  const resolver = createPreflightConfigResolver(config);

  return async (ctx, next) => {
    const origin = ctx.origin;

    // The requested method
    const requestMethod = ctx.headers[HttpHeader.AccessControlRequestMethod] as string | undefined;

    // If there are no Access-Control-Request-Method this is not CORS preflight
    if (!requestMethod) {
      return next(ctx);
    }

    const cors = resolver(origin);

    if (cors === false) {
      return next(ctx);
    }

    // At this point we know the request is a CORS Preflight
    // We don't call the next middleware and return a CorsPreflightResponse
    return new CorsPreflightResponse(cors);
  };
}

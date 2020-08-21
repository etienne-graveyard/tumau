import { Middleware, RequestConsumer, TumauResponse, HttpError } from '@tumau/core';
import { CorsActualResponse } from './CorsActualResponse';
import { CorsActualConfig, createActualConfigResolver } from './utils';
import { DEFAULT_ALLOW_ORIGIN, DEFAULT_ALLOW_CREDENTIALS } from './defaults';

export function CorsActual(config: CorsActualConfig = {}): Middleware {
  const { allowOrigin = DEFAULT_ALLOW_ORIGIN, allowCredentials = DEFAULT_ALLOW_CREDENTIALS } = config;

  if (allowOrigin.indexOf('*') >= 0 && allowCredentials === true) {
    throw new Error(`credentials not supported with wildcard`);
  }

  const resolver = createActualConfigResolver(config);

  return async (ctx, next) => {
    const request = ctx.readContextOrFail(RequestConsumer);
    const origin = request.origin;

    const response = await next(ctx);

    // Can't respond on upgrade
    if (request.isUpgrade) {
      return response;
    }
    if (response instanceof TumauResponse === false) {
      throw new HttpError.Internal(`Cors received an invalid response !`);
    }

    const cors = resolver(origin);
    // invalid origin, continue without any cors header
    if (cors === false) {
      return response;
    }
    const res = response as TumauResponse | null;

    return CorsActualResponse.fromResponse(res, cors);
  };
}

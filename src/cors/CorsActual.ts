import { Middleware, TumauResponse, HttpError, TumauHandlerResponse } from '../core';
import { CorsActualResponse } from './CorsActualResponse';
import { CorsActualConfig, createActualConfigResolver } from './utils';

export function CorsActual(config: CorsActualConfig = {}): Middleware {
  const resolver = createActualConfigResolver(config);

  return async (ctx, next) => {
    const origin = ctx.origin;

    const response = await next(ctx);

    // Can't respond on upgrade
    if (ctx.isUpgrade) {
      return response;
    }
    if (response instanceof TumauHandlerResponse) {
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

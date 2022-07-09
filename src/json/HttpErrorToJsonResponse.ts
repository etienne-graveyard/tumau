import { Middleware, HttpError } from '../core';
import { JsonResponse } from './JsonResponse';

export const HttpErrorToJsonResponse: Middleware = async (ctx, next) => {
  const debug = ctx.debugMode;
  if (ctx.isUpgrade) {
    // If Upgrade ignore this since upgrade can't return a response
    return next(ctx);
  }
  try {
    return await next(ctx);
  } catch (error) {
    if (error instanceof HttpError) {
      // TODO: Use a logger context for that !
      // console.error(error);
      return JsonResponse.fromError(error, debug);
    }
    throw error;
  }
};

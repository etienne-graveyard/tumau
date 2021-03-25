import { Middleware, RequestConsumer, HttpError, DebugConsumer } from '@tumau/core';
import { JsonResponse } from './JsonResponse';

export const HttpErrorToJsonResponse: Middleware = async (ctx, next) => {
  const debug = ctx.get(DebugConsumer);
  const isUpgrade = ctx.getOrFail(RequestConsumer).isUpgrade;
  if (isUpgrade) {
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

import { Middleware, RequestConsumer, HttpError, DebugConsumer } from '@tumau/core';
import { JsonResponse } from './JsonResponse';

export const HttpErrorToJson: Middleware = async (ctx, next) => {
  const debug = ctx.readContext(DebugConsumer);
  const isUpgrade = ctx.readContextOrFail(RequestConsumer).isUpgrade;
  if (isUpgrade) {
    // If Upgrade ignore this since upgrade can't return a response
    return next(ctx);
  }
  try {
    return await next(ctx);
  } catch (error) {
    if (error instanceof HttpError) {
      return JsonResponse.fromError(error, debug);
    }
    throw error;
  }
};

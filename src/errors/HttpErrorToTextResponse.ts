import { HttpError, Middleware, TumauUpgradeResponse, TumauResponse } from '../core';

/**
 * Handle HttpError and respond with a Text reponse
 */
export const HttpErrorToTextResponse: Middleware = async (ctx, next) => {
  const debug = ctx.debugMode;
  try {
    return await next(ctx);
  } catch (error) {
    if (error instanceof HttpError === false) {
      throw error;
    }
    if (ctx.isUpgrade) {
      return TumauUpgradeResponse.fromError(error);
    }
    return TumauResponse.fromError(error, debug);
  }
};

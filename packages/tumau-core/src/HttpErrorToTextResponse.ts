import { Middleware } from './Middleware';
import { TumauResponse } from './TumauResponse';
import { TumauUpgradeResponse } from './TumauUpgradeResponse';
import { RequestConsumer, DebugConsumer } from './Contexts';
import { HttpError } from './HttpError';

/**
 * Handle HttpError and respond with a Text reponse
 */
export const HttpErrorToTextResponse: Middleware = async (ctx, next) => {
  const isUpgrade = ctx.readContextOrFail(RequestConsumer).isUpgrade;
  const debug = ctx.readContext(DebugConsumer);
  try {
    return await next(ctx);
  } catch (error) {
    if (error instanceof HttpError === false) {
      throw error;
    }
    if (isUpgrade) {
      return TumauUpgradeResponse.fromError(error);
    }
    return TumauResponse.fromError(error, debug);
  }
};

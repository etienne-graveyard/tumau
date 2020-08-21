import { Middleware } from './Middleware';
import { TumauResponse } from './TumauResponse';
import { HttpError } from './HttpError';
import { RequestConsumer } from './Contexts';
import { TumauUpgradeResponse } from './TumauUpgradeResponse';

/**
 * Return a Valid Repsonse or throw an HttpError
 */
export const InvalidResponseToHttpError: Middleware = async (ctx, next) => {
  const request = ctx.readContext(RequestConsumer);
  const isUpgrade = request.isUpgrade;
  const response = await next(ctx);
  if (isUpgrade) {
    if (response === null || response === undefined) {
      throw new HttpError.ServerDidNotRespond();
    }
    if (response instanceof TumauUpgradeResponse === false) {
      throw new HttpError.Internal(
        `The returned response is not valid (does not inherit the TumauUpgradeResponse class)`
      );
    }
    return response;
  }
  if (response === null || response === undefined) {
    throw new HttpError.ServerDidNotRespond();
  }
  if (response instanceof TumauResponse === false) {
    throw new HttpError.Internal(`The returned response is not valid (does not inherit the TumauResponse class)`);
  }
  return response;
};

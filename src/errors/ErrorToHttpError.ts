import { Middleware, HttpError } from '../core';
import { LoggerConsumer } from '../logger';

export type ErrorToHttpErrorOptions = {
  logOnError?: boolean;
};

/**
 * Handle any error and convert it to an HttpError if it's not one
 */
export function ErrorToHttpError({ logOnError = true }: ErrorToHttpErrorOptions = {}): Middleware {
  return async (ctx, next) => {
    try {
      return await next(ctx);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      if (logOnError) {
        const logger = ctx.get(LoggerConsumer);
        logger.error(error);
      }
      throw HttpError.Internal.fromError(error);
    }
  };
}

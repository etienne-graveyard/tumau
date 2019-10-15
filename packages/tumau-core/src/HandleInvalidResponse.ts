import { Middleware } from './Middleware';
import { Response } from './Response';
import { HttpError } from './HttpError';

export const HandleInvalidResponse: Middleware = async (ctx, next) => {
  const response = await next(ctx);
  if (response === null || response === undefined) {
    throw new HttpError.ServerDidNotRespond();
  }
  if (response instanceof Response === false) {
    throw new HttpError.Internal(`The returned response is not valid (does not inherit the Response class)`);
  }
  return response;
};

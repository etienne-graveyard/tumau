import { Middleware } from './Middleware';
import { BaseContext } from './BaseContext';
import { Response } from './Response';
import { HttpError } from './HttpError';

export const HandleInvalidResponse = <Ctx extends BaseContext>(): Middleware<Ctx> => {
  return async (ctx, next) => {
    const result = await next(ctx);
    if (result.response === null || result.response === undefined) {
      throw new HttpError.ServerDidNotRespond();
    }
    if (result.response instanceof Response === false) {
      throw new HttpError.Internal(`The returned response is not valid (does not inherit the Response class)`);
    }
    return result;
  };
};

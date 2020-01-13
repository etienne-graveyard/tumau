import { Middleware } from './Middleware';
import { TumauResponse } from './TumauResponse';
import { HttpError } from './HttpError';

export const HandleInvalidResponse: Middleware = async next => {
  const response = await next.next();
  if (response === null || response === undefined) {
    throw new HttpError.ServerDidNotRespond();
  }
  if (response instanceof TumauResponse === false) {
    throw new HttpError.Internal(`The returned response is not valid (does not inherit the TumauResponse class)`);
  }
  return response;
};

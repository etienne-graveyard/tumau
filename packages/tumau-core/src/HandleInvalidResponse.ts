import { Middleware } from './Middleware';
import { TumauResponse } from './TumauResponse';
import { HttpError } from './HttpError';
import { RequestConsumer } from './Contexts';

export const HandleInvalidResponse: Middleware = async tools => {
  const request = tools.readContext(RequestConsumer);
  const isUpgrade = request.isUpgrade;
  const response = await tools.next();
  if (isUpgrade) {
    // when upgrade this middleware is useless because we can't send a response
    // and response are checked by Server
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

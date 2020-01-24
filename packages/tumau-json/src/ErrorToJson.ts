import { Middleware, RequestConsumer, HttpError } from '@tumau/core';
import { JsonResponse } from './JsonResponse';

export const ErrorToJson: Middleware = async tools => {
  const isUpgrade = tools.readContextOrFail(RequestConsumer).isUpgrade;
  if (isUpgrade) {
    // If Upgrade ignore this since upgrade can't return a response
    return tools.next();
  }
  const res = await tools.next();
  if (res instanceof HttpError) {
    return JsonResponse.fromError(res);
  }
  return res;
};

import { Middleware, RequestConsumer, HttpError } from '@tumau/core';
import { JsonResponse } from './JsonResponse';

export const HttpErrorToJson: Middleware = async tools => {
  const isUpgrade = tools.readContextOrFail(RequestConsumer).isUpgrade;
  if (isUpgrade) {
    // If Upgrade ignore this since upgrade can't return a response
    return tools.next();
  }
  try {
    return await tools.next();
  } catch (error) {
    if (error instanceof HttpError) {
      return JsonResponse.fromError(error);
    }
    throw error;
  }
};

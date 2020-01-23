import { Middleware, RequestConsumer } from '@tumau/core';
import { JsonResponse } from './JsonResponse';

export const ErrorToJson: Middleware = async tools => {
  const isUpgrade = tools.readContextOrFail(RequestConsumer).isUpgrade;
  if (isUpgrade) {
    // If Upgrade ignore this since upgrade can't return a response
    return tools.next();
  }
  try {
    return await tools.next();
  } catch (error) {
    return JsonResponse.fromError(error);
  }
};

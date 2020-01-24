import { Middleware, RequestConsumer } from '@tumau/core';
import { JsonResponse } from './JsonResponse';

export const EnsureJsonResponse: Middleware = async tools => {
  const isUpgrade = tools.readContextOrFail(RequestConsumer).isUpgrade;
  if (isUpgrade) {
    // If Upgrade ignore this since upgrade can't return a response
    return tools.next();
  }
  try {
    const res = await tools.next();
    if (res instanceof JsonResponse) {
      return res;
    }
    return JsonResponse.fromResponse(res);
  } catch (error) {
    return JsonResponse.fromError(error);
  }
};

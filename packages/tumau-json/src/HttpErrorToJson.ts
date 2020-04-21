import { Middleware, RequestConsumer, HttpError, DebugConsumer } from '@tumau/core';
import { JsonResponse } from './JsonResponse';

export const HttpErrorToJson: Middleware = async (tools) => {
  const debug = tools.readContext(DebugConsumer);
  const isUpgrade = tools.readContextOrFail(RequestConsumer).isUpgrade;
  if (isUpgrade) {
    // If Upgrade ignore this since upgrade can't return a response
    return tools.next();
  }
  try {
    return await tools.next();
  } catch (error) {
    if (error instanceof HttpError) {
      return JsonResponse.fromError(error, debug);
    }
    throw error;
  }
};

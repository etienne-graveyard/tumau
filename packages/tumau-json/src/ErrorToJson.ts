import { Middleware, TumauResponse } from '@tumau/core';
import { JsonResponse } from './JsonResponse';

export const ErrorToJson: Middleware = async (tools): Promise<TumauResponse | null> => {
  try {
    return await tools.next();
  } catch (error) {
    return JsonResponse.fromError(error);
  }
};

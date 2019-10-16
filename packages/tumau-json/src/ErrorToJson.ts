import { Middleware, TumauResponse } from '@tumau/core';
import { JsonResponse } from './JsonResponse';

export const ErrorToJson: Middleware = async (ctx, next): Promise<TumauResponse | null> => {
  try {
    return await next(ctx);
  } catch (error) {
    return JsonResponse.fromError(error);
  }
};

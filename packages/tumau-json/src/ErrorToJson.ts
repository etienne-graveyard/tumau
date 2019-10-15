import { Middleware, Response } from '@tumau/core';
import { JsonResponse } from './JsonResponse';

export const ErrorToJson: Middleware = async (ctx, next): Promise<Response | null> => {
  try {
    return await next(ctx);
  } catch (error) {
    return JsonResponse.fromError(error);
  }
};

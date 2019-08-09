import { JsonParserCtx } from './JsonParser';
import { Middleware, ResultSync } from '@tumau/core';
import { JsonResponse } from './JsonResponse';

export function ErrorToJson<Ctx extends JsonParserCtx>(): Middleware<Ctx> {
  return async (prevCtx, next): Promise<ResultSync<Ctx>> => {
    try {
      const result = await next(prevCtx);
      return result as any;
    } catch (error) {
      return JsonResponse.fromError(error);
    }
  };
}

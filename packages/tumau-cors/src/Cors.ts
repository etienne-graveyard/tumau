import { Context } from '@tumau/core';
import { createCorsMiddleware } from './CorsMiddleware';
import { CorsContext, DEFAULT_CORS_CONTEXT } from './CorsContext';

export const Cors = {
  create: createCorsMiddleware,
  setCors,
};

type UpdateCors = (cors: CorsContext | null) => CorsContext;

function setCors(ctx: Context, cors: Partial<CorsContext> | UpdateCors): Context {
  const prevCors = ctx.get(CorsContext.Consumer);
  const defaultUpdate: UpdateCors = prevCors => ({
    ...(prevCors || DEFAULT_CORS_CONTEXT),
    ...cors,
  });
  const updateFn = typeof cors === 'function' ? cors : defaultUpdate;
  const updated = updateFn(prevCors);
  return ctx.set(CorsContext.Provider(updated));
}

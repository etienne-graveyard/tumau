import { Tools } from '@tumau/core';
import { createCorsMiddleware } from './CorsMiddleware';
import { CorsContext, DEFAULT_CORS_CONTEXT } from './CorsContext';

export const Cors = {
  create: createCorsMiddleware,
  setCors,
};

type UpdateCors = (cors: CorsContext | null) => CorsContext;

function setCors(tools: Tools, cors: Partial<CorsContext> | UpdateCors): Tools {
  const prevCors = tools.readContext(CorsContext.Consumer);
  const defaultUpdate: UpdateCors = prevCors => ({
    ...(prevCors || DEFAULT_CORS_CONTEXT),
    ...cors,
  });
  const updateFn = typeof cors === 'function' ? cors : defaultUpdate;
  const updated = updateFn(prevCors);
  return tools.withContext(CorsContext.Provider(updated));
}

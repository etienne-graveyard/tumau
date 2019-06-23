import { Context, Response } from '@tumau/core';
import { RouterRequest } from './RouterRequest';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RouterContext extends Context<RouterRequest, Response> {}

export const RouterContext = {
  create: createRouterContext,
};

async function createRouterContext(
  parentCtx: Context | RouterContext,
  routerRequest: RouterRequest
): Promise<RouterContext> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { request, ...other } = parentCtx;

  const ctx: RouterContext = {
    ...other,
    request: routerRequest,
  };

  return ctx;
}

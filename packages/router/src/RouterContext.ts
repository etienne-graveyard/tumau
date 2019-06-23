import { Context, Response } from '../../tumau/pkg/dist-types';
import { RouterRequest } from './RouterRequest';

export interface RouterContext extends Context<RouterRequest, Response> {}

export const RouterContext = {
  create: createRouterContext,
};

async function createRouterContext(
  parentCtx: Context | RouterContext,
  routerRequest: RouterRequest
): Promise<RouterContext> {
  const { request, ...other } = parentCtx;

  const ctx: RouterContext = {
    ...other,
    request: routerRequest,
  };

  return ctx;
}

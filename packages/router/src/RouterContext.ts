import { Context, Response } from '@tumau/core';
import { RouterRequest } from './RouterRequest';

export interface RouterContext extends Context<RouterRequest, Response> {}

export const RouterContext = {
  create: createRouterContext,
};

function createRouterContext(parentCtx: Context | RouterContext, routerRequest: RouterRequest): RouterContext {
  const { request, ...other } = parentCtx;

  const ctx: RouterContext = {
    ...other,
    request: routerRequest,
  };

  return ctx;
}

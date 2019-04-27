import { Request } from '@tumau/core';
import { Params, RouterMiddleware, FindResult } from './Router';

export interface RouterRequest extends Request {
  params: Params;
  middleware: RouterMiddleware;
  notFound: boolean;
  parentRoutePattern: string;
}

export const RouterRequest = {
  create: createRouterRequest,
  isRouterRequest,
};

function createRouterRequest(
  request: Request | RouterRequest,
  find: FindResult | false,
  noMatch: RouterMiddleware
): RouterRequest {
  const middleware = find ? find.route.middleware : noMatch;
  const pattern = find ? find.route.pattern : '';
  const parentRoutePattern = isRouterRequest(request) ? request.parentRoutePattern + pattern : pattern;
  const routerRequest: RouterRequest = {
    ...request,
    params: find ? find.params : {},
    middleware,
    notFound: find === false,
    parentRoutePattern,
  };

  return routerRequest;
}

function isRouterRequest(request: Request | RouterRequest): request is RouterRequest {
  return !!(request as any).middleware;
}

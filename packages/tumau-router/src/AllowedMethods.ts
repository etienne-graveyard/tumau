import { Middleware, HttpMethod, TumauResponse, RequestContext } from '@tumau/core';
import { Routes, Route } from './Route';
import { UrlParserContext } from '@tumau/url-parser';
import { RouterAllowedMethodsContext } from './RouterContext';
import { AllowedMethodsResponse } from './AllowedMethodsResponse';

export function AllowedMethods(routes: Routes): Middleware {
  // flatten routes
  const flatRoutes = Route.flatten(routes);
  return async (ctx, next): Promise<null | TumauResponse> => {
    const request = ctx.getOrThrow(RequestContext);
    if (request.method !== HttpMethod.OPTIONS) {
      return next(ctx);
    }
    const parsedUrl = ctx.getOrThrow(UrlParserContext);
    const matchingRoutesAllMethods = Route.find(flatRoutes, parsedUrl.pathname);

    const allowedMethods = matchingRoutesAllMethods.reduce<Set<HttpMethod> | null>((acc, findResult) => {
      if (acc === null || findResult.route.method === null) {
        return null;
      }
      if (Array.isArray(findResult.route.method)) {
        findResult.route.method.forEach(m => {
          acc.add(m);
        });
      } else {
        acc.add(findResult.route.method);
      }
      return acc;
    }, new Set<HttpMethod>());

    const methods = allowedMethods || HttpMethod.__ALL;
    const result = await next(ctx.set(RouterAllowedMethodsContext.provide(methods)));
    const response = result || new TumauResponse({ code: 204 });
    return new AllowedMethodsResponse(response, methods);
  };
}

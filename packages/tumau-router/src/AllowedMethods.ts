import { Middleware, HttpMethod, Response, RequestContext } from '@tumau/core';
import { Routes, Route } from './Route';
import { UrlParserContext } from '@tumau/url-parser';
import { RouterAllowedMethodsContext } from './RouterContext';

export function AllowedMethods(routes: Routes): Middleware {
  // flatten routes
  const flatRoutes = Route.flatten(routes);
  return async (ctx, next): Promise<null | Response> => {
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
    const allowHeaderContent = Array.from(methods.values()).join(',');
    let response = result || new Response({ code: 204 });
    response = {
      ...response,
      headers: {
        ...response.headers,
        ['Allow']: allowHeaderContent,
      },
    };

    return response;
  };
}

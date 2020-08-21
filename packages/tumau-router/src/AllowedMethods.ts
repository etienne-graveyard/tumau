import { Middleware, HttpMethod, TumauResponse, RequestConsumer, Result, HttpError } from '@tumau/core';
import { Routes, Route } from './Route';
import { UrlParserConsumer } from '@tumau/url-parser';
import { RouterAllowedMethodsContext } from './RouterContext';
import { AllowedMethodsResponse } from './AllowedMethodsResponse';

export function AllowedMethods(routes: Routes): Middleware {
  // flatten routes
  const flatRoutes = Route.flatten(routes);
  return async (ctx, next): Promise<Result> => {
    const request = ctx.readContextOrFail(RequestConsumer);
    if (request.method !== HttpMethod.OPTIONS) {
      return next(ctx);
    }
    const parsedUrl = ctx.readContextOrFail(UrlParserConsumer);
    const matchingRoutesAllMethods = Route.find(flatRoutes, parsedUrl.pathname);

    const allowedMethods = matchingRoutesAllMethods.reduce<Set<HttpMethod> | null>((acc, findResult) => {
      if (acc === null || findResult.route.method === null) {
        return null;
      }
      if (Array.isArray(findResult.route.method)) {
        findResult.route.method.forEach((m) => {
          acc.add(m);
        });
      } else {
        acc.add(findResult.route.method);
      }
      return acc;
    }, new Set<HttpMethod>());

    const methods = allowedMethods || HttpMethod.__ALL;
    const response = await next(ctx.withContext(RouterAllowedMethodsContext.Provider(methods)));
    if (response instanceof TumauResponse === false) {
      throw new HttpError.Internal(`AllowedMethods received an invalid response !`);
    }
    const res = response === null ? new TumauResponse({ code: 204 }) : (response as TumauResponse);
    return new AllowedMethodsResponse(res, methods);
  };
}

import { RouterCtx } from './RouterCtx';
import { Middleware, Result, HttpMethod, Response, ALL_HTTP_METHODS } from '@tumau/core';
import { Routes, Route } from './Route';
import { notNill } from './utils';

export function AllowedMethods<Ctx extends RouterCtx>(routes: Routes<Ctx>): Middleware<Ctx> {
  // flatten routes
  const flatRoutes = Route.flatten(routes);
  return async (ctx, next): Promise<Result<Ctx>> => {
    if (ctx.request.method !== HttpMethod.OPTIONS) {
      return next(ctx);
    }

    const matchingRoutesAllMethods = Route.find(flatRoutes, notNill(ctx.parsedUrl).pathname);

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

    const ctxWithMethods: Ctx = {
      ...ctx,
      routerAllowedMethods: allowedMethods,
    };

    const result = await next(ctxWithMethods);
    if (result.ctx.routerAllowedMethods === undefined) {
      // for some reason our context has been removed
      return result;
    }
    const methods = result.ctx.routerAllowedMethods || ALL_HTTP_METHODS;
    const allowHeaderContent = Array.from(methods.values()).join(',');
    let response = result.response || Response.create({ code: 204 });
    response = {
      ...response,
      headers: {
        ...response.headers,
        ['Allow']: allowHeaderContent,
      },
    };

    return {
      ...result,
      response,
    };
  };
}

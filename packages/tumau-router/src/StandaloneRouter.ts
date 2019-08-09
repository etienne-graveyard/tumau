import { Middleware, Result, ResultSync } from '@tumau/core';
import { RouterCtx } from './RouterCtx';
import { Route, Routes } from './Route';
import { notNill } from './utils';

/**
 * Handle an array of routes
 */
export function StandaloneRouter<Ctx extends RouterCtx>(routes: Routes<Ctx>): Middleware<Ctx> {
  // flatten routes
  const flatRoutes = Route.flatten(routes);
  return async (ctx, next): Promise<ResultSync<Ctx>> => {
    if (ctx.router) {
      console.warn(
        [
          `Warning: Using a Router inside another Router will break 'Allow' header for OPTIONS request !`,
          `If you want to group routes together you can use Route.namespace() or the low level Route.crete()`,
        ].join('\n')
      );
    }
    // all matching routes
    const matchingRoutesAllMethods = Route.find(flatRoutes, notNill(ctx.parsedUrl).pathname);
    const requestMethod = ctx.request.method;

    const matchingRoutes = matchingRoutesAllMethods.filter(findResult => {
      const expectedMethod = findResult.route.method;
      const methodMatch =
        requestMethod === null ||
        (Array.isArray(expectedMethod) ? expectedMethod.indexOf(requestMethod) > -1 : expectedMethod === requestMethod);
      return methodMatch;
    });

    async function handleNext(index: number): Promise<Result<Ctx>> {
      const findResult = matchingRoutes[index] || null;
      const routeMiddleware = findResult ? findResult.route.middleware : null;
      const pattern = findResult ? findResult.route.pattern : '';
      const composedPattern = ctx.router ? ctx.router.pattern + pattern : pattern;

      const nextCtx: Ctx = {
        ...ctx,
        router: {
          middleware: routeMiddleware,
          pattern: composedPattern,
          notFound: findResult === null,
          params: findResult ? findResult.params : {},
        },
      };

      if (findResult === null) {
        // no more match, run next
        return next(nextCtx);
      }

      if (findResult.route.middleware === null) {
        return next(nextCtx);
      }

      // found a match, run it's middleware
      const res = await findResult.route.middleware(nextCtx, (ctx: RouterCtx) => {
        return next(ctx as any);
      });
      const result = Middleware.resolveResult(nextCtx, res);

      // If the match did not return a response handle the next match
      if (result.response === null) {
        return handleNext(index + 1);
      }

      // return the response
      return result;
    }

    return handleNext(0);
  };
}

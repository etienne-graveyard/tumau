import { Middleware, TumauResponse, RequestConsumer, Context } from '@tumau/core';
import { Route, Routes } from './Route';
import { RouterContext } from './RouterContext';
import { UrlParserConsumer } from '@tumau/url-parser';

/**
 * Handle an array of routes
 */
export function Router(routes: Routes): Middleware {
  // flatten routes
  const flatRoutes = Route.flatten(routes);
  return async (ctx, next): Promise<null | TumauResponse> => {
    if (ctx.has(RouterContext.Consumer)) {
      console.warn(
        [
          `Warning: Using a Router inside another Router will break 'Allow' header for OPTIONS request !`,
          `If you want to group routes together you can use Route.namespace() or the low level Route.create()`,
        ].join('\n')
      );
    }

    // const routerCtx = ctx.get(RouterContext.Consumer);
    // all matching routes
    const parsedUrl = ctx.getOrThrow(UrlParserConsumer);
    const matchingRoutesAllMethods = Route.find(flatRoutes, parsedUrl.pathname);
    const request = ctx.getOrThrow(RequestConsumer);
    const requestMethod = request.method;

    const matchingRoutes = matchingRoutesAllMethods.filter(findResult => {
      const expectedMethod = findResult.route.method;

      const methodMatch =
        expectedMethod === null ||
        (Array.isArray(expectedMethod) ? expectedMethod.indexOf(requestMethod) > -1 : expectedMethod === requestMethod);
      return methodMatch;
    });

    return handleNext(0, ctx);

    async function handleNext(index: number, ctx: Context): Promise<null | TumauResponse> {
      const findResult = matchingRoutes[index] || null;
      const routeMiddleware = findResult ? findResult.route.middleware : null;
      const pattern = findResult ? findResult.route.pattern || null : null;

      const routerData: RouterContext = {
        middleware: routeMiddleware,
        pattern: pattern,
        notFound: findResult === null,
        params: findResult ? findResult.params : {},
      };

      const withRouterCtx = ctx.set(RouterContext.Provider(routerData), ...(findResult ? findResult.providers : []));

      if (findResult === null) {
        // no more match, run next
        return next(withRouterCtx);
      }

      if (findResult.route.middleware === null) {
        return next(withRouterCtx);
      }

      const result = await findResult.route.middleware(withRouterCtx, nextCtx => {
        return handleNext(index + 1, nextCtx);
      });

      // If the match did not return a response handle the next match
      if (result === null) {
        return handleNext(index + 1, withRouterCtx);
      }

      // return the response
      return result;
    }
  };
}

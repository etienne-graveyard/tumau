import { Middleware, RequestConsumer, Tools, HttpError, Result } from '@tumau/core';
import { Route, Routes, FindResult } from './Route';
import { RouterContext } from './RouterContext';
import { UrlParserConsumer } from '@tumau/url-parser';
import { Chemin } from 'chemin';

/**
 * Handle an array of routes
 */
export function Router(routes: Routes): Middleware {
  // flatten routes
  const flatRoutes = Route.flatten(routes);
  return async (tools): Promise<Result> => {
    if (tools.hasContext(RouterContext.Consumer)) {
      console.warn(
        [
          `Warning: Using a Router inside another Router will break 'Allow' header for OPTIONS request !`,
          `If you want to group routes together you can use Route.namespace() or the low level Route.create()`,
        ].join('\n')
      );
    }

    // all matching routes
    const parsedUrl = tools.readContext(UrlParserConsumer);
    if (!parsedUrl) {
      throw new HttpError.Internal(`[Router] Missing UrlParser contenxt !`);
    }
    const routesWithMatchingPattern = Route.find(flatRoutes, parsedUrl.pathname);
    const request = tools.readContextOrFail(RequestConsumer);
    const requestMethod = request.method;
    const isUpgrade = request.isUpgrade;

    const matchingRoutes = routesWithMatchingPattern.filter((findResult) => {
      if (findResult.route.upgrade !== null && findResult.route.upgrade !== isUpgrade) {
        // upgrade did not match
        return false;
      }
      const routeMethod = findResult.route.method;
      if (routeMethod === null) {
        // any method
        return true;
      }
      if (Array.isArray(routeMethod)) {
        // array of allowed methods
        return routeMethod.includes(requestMethod);
      }
      return routeMethod === requestMethod;
    });

    return handleNext(0);

    async function handleNext(index: number): Promise<Result> {
      const findResult: FindResult | null = matchingRoutes[index] || null;
      const routeMiddleware = findResult ? findResult.route.middleware : null;
      const route = findResult ? findResult.route : null;
      const pattern = route ? route.pattern : null;
      const patterns = route ? route.patterns || [] : [];
      const params = findResult ? findResult.params : {};

      const has = (chemin: Chemin): boolean => {
        return patterns.indexOf(chemin) >= 0;
      };

      // create router context
      const routerData: RouterContext = {
        middleware: routeMiddleware,
        notFound: findResult === null,
        pattern,
        patterns,
        params,
        has,
        get: <P>(chemin: Chemin<P>) => {
          return has(chemin) ? (params as P) : null;
        },
        getOrFail: <P>(chemin: Chemin<P>) => {
          if (!has(chemin)) {
            throw new Error(`Chemin is not part of the route context !`);
          }
          return params as P;
        },
      };

      const withRouterDataTools = tools.withContext(RouterContext.Provider(routerData));

      if (findResult === null) {
        // no more match, run next
        return withRouterDataTools.next();
      }

      if (findResult.route.middleware === null) {
        // route with no middleware, this is still a match
        // it's like if they was a middleware: tools => tools.next();
        return withRouterDataTools.next();
      }

      // call the route with next pointing to the middleware after the router
      const currentContextStack = Tools.getContext(withRouterDataTools);
      const middleTools = Tools.create(currentContextStack, Tools.getDone(tools));
      const result = await findResult.route.middleware(middleTools);

      // If the match did not return a response
      // proceed like if the route didn't match
      if (result === null) {
        return handleNext(index + 1);
      }

      // return the response
      return result;
    }
  };
}

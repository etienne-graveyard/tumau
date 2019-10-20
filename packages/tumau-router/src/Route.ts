import { Middleware, HttpMethod, ContextProvider } from '@tumau/core';
import { RoutePattern } from './RoutePattern';

const ROUTE_TOKEN = Symbol('ROUTE_TOKEN');

type Method = null | HttpMethod | Array<HttpMethod>;

export interface Route {
  [ROUTE_TOKEN]: true;
  pattern: RoutePattern | null;
  exact: boolean;
  middleware: Array<Middleware>;
  method: Method;
  children: Array<Route>;
}

export interface RouteResolved {
  [ROUTE_TOKEN]: true;
  pattern: RoutePattern | null;
  exact: boolean;
  middleware: null | Middleware;
  method: Method;
  children: Array<Route>;
}

export type Routes = Array<Route>;

const withMethod = (method: Method) => (pattern: RoutePattern | string | null, ...middleware: Array<Middleware>) =>
  createRoute({ method, pattern }, middleware);

export const Route = {
  flatten: flattenAllRoutes,
  create: createRoute,
  find,
  GET: withMethod(HttpMethod.GET),
  POST: withMethod(HttpMethod.POST),
  PUT: withMethod(HttpMethod.PUT),
  DELETE: withMethod(HttpMethod.DELETE),
  PATCH: withMethod(HttpMethod.PATCH),
  all: withMethod(null),
  namespace: (pattern: string | null, routes: Routes) =>
    createRoute({ method: null, pattern, exact: false }, null, routes),
};

interface RouteOptions {
  method?: Method;
  pattern?: RoutePattern | string | null;
  exact?: boolean;
}

function createRoute(
  options: RouteOptions,
  middleware: null | Middleware | Array<Middleware>,
  children: Routes = []
): Route {
  const { exact = true, method = null, pattern = null } = options;
  const patternResolved = typeof pattern === 'string' ? RoutePattern.parse(pattern) : pattern;
  return {
    [ROUTE_TOKEN]: true,
    pattern: patternResolved,
    exact,
    middleware: resolveMiddleware(middleware),
    method,
    children,
  };
}

function resolveMiddleware(middleware: null | Middleware | Array<Middleware>): Array<Middleware> {
  if (middleware === null) {
    return [];
  }
  if (Array.isArray(middleware)) {
    return middleware;
  }
  return [middleware];
}

function flattenAllRoutes(routes: Routes): Array<RouteResolved> {
  const flat = flattenRoutes(routes);
  return flat.map(route => {
    return {
      ...route,
      middleware: route.middleware.length === 1 ? route.middleware[0] : Middleware.compose(...route.middleware),
    };
  });
}

/**
 * Flatten routes
 */
function flattenRoutes(routes: Routes): Array<Route> {
  function flattenSingle(route: Route): Routes {
    if (route.children.length === 0) {
      return [route];
    }
    const parentMiddleware = route.middleware;
    return flattenRoutes(
      route.children
        .map((childRoute): Route | null => {
          const middlewares = [...parentMiddleware, ...childRoute.middleware];
          const patterns = [route.pattern, childRoute.pattern];
          if (childRoute.pattern && route.exact) {
            console.warn(
              `Error: ${route.pattern} is expected to be exact but its children ${childRoute.pattern} has a pattern, the child pattern will be ignored`
            );
            patterns[1] = null;
          }
          const pattern = RoutePattern.create(
            ...patterns.filter((v: RoutePattern | null): v is RoutePattern => v !== null)
          );
          const exact = route.exact || childRoute.exact;
          const method = combineMethods(route.method, childRoute.method, m => {
            console.warn(
              `Error: in ${route.pattern} > ${route.pattern} the Method ${m} is not allowed by parent. It will be ignored !`
            );
          });
          return createRoute({ pattern, exact, method }, middlewares, childRoute.children);
        })
        .filter((r: Route | null): r is Route => r !== null)
    );
  }

  return routes
    .reduce<Routes>((acc, route) => {
      acc.push(...flattenSingle(route));
      return acc;
    }, [])
    .filter(route => {
      if (route.middleware.length === 0) {
        console.warn(`Route ${route.pattern} has no middleware, it will be ignored`);
        return false;
      }
      if (route.pattern === null && route.method === null) {
        console.warn(
          `A Route has no pattern and not method specified, it should be a simple middleware instead of a route`
        );
      }
      if (route.children.length !== 0) {
        throw new Error(`Flatten returned a route with children ! That shouldn't have happened...`);
      }
      return true;
    });
}

function combineMethods(parent: Method, child: Method, onInvalid: (method: HttpMethod) => void): Method {
  if (child === null) {
    return parent;
  }
  if (parent === null) {
    return child;
  }
  const childArr = Array.isArray(child) ? child : [child];
  const parentArr = Array.isArray(parent) ? parent : [parent];
  const common: Array<HttpMethod> = [];
  childArr.forEach(m => {
    if (parentArr.indexOf(m) >= 0) {
      common.push(m);
    } else {
      onInvalid(m);
    }
  });
  return common;
}

export interface FindResult {
  providers: Array<ContextProvider<any, false>>;
  route: RouteResolved;
  index: number;
  params: { [key: string]: any };
}

function find(routes: Array<RouteResolved>, pathname: string): Array<FindResult> {
  const parts = RoutePattern.splitPathname(pathname);
  return routes
    .map((route, index): FindResult | false => {
      if (route.pattern === null) {
        return {
          providers: [],
          route,
          index,
          params: {},
        };
      }
      const match = RoutePattern.match(route.pattern, parts);

      if (match === false) {
        return false;
      }
      if (route.exact && match.next.length > 0) {
        return false;
      }
      return {
        index,
        providers: match.providers,
        route: route,
        params: match.params,
      };
    })
    .filter((result: FindResult | false): result is FindResult => {
      return result !== false;
    });
}

import { Middleware, HttpMethod, compose } from '@tumau/core';
import { Chemin, splitPathname } from 'chemin';

const ROUTE_TOKEN = Symbol('ROUTE_TOKEN');

type Method = null | HttpMethod | Array<HttpMethod>;

export interface Route {
  [ROUTE_TOKEN]: true;
  pattern: Chemin | null;
  exact: boolean;
  middleware: Array<Middleware>;
  method: Method;
  upgrade: boolean | null;
  children: Array<Route>;
}

export interface RouteResolved {
  [ROUTE_TOKEN]: true;
  pattern: Chemin | null;
  // if pattern is compose of other Chemin we extract them
  patterns: Array<Chemin> | null;
  exact: boolean;
  middleware: Middleware | null;
  method: Method;
  upgrade: boolean | null;
  children: Array<Route>;
}

export type Routes = Array<Route>;

const withMethod = (method: Method) => (pattern: Chemin | string | null, ...middleware: Array<Middleware>) =>
  createRoute({ method, pattern, upgrade: false }, middleware);

export const Route = {
  flatten: flattenAllRoutes,
  create: createRoute,
  find,
  GET: withMethod(HttpMethod.GET),
  POST: withMethod(HttpMethod.POST),
  PUT: withMethod(HttpMethod.PUT),
  DELETE: withMethod(HttpMethod.DELETE),
  PATCH: withMethod(HttpMethod.PATCH),
  UPGRADE: (pattern: Chemin | string | null, ...middleware: Array<Middleware>): Route =>
    createRoute({ method: HttpMethod.GET, upgrade: true, pattern }, middleware),
  all: withMethod(null),
  namespace: (pattern: Chemin | string | null, routes: Routes): Route =>
    createRoute({ method: null, pattern, exact: false }, null, routes),
  fallback: (...middlewares: Array<Middleware>): Route => createRoute({ method: null, exact: false }, middlewares),
};

interface RouteOptions {
  upgrade?: boolean | null;
  method?: Method;
  pattern?: Chemin | string | null;
  exact?: boolean;
}

function createRoute(
  options: RouteOptions,
  middleware: null | Middleware | Array<Middleware>,
  children: Routes = []
): Route {
  const { exact = true, method = null, pattern = null, upgrade = null } = options;
  const patternResolved = typeof pattern === 'string' ? Chemin.parse(pattern) : pattern;
  return {
    [ROUTE_TOKEN]: true,
    pattern: patternResolved,
    exact,
    middleware: resolveMiddleware(middleware),
    method,
    upgrade,
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
  return flat.map((route) => {
    return {
      [ROUTE_TOKEN]: true,
      children: route.children,
      pattern: route.pattern,
      exact: route.exact,
      method: route.method,
      upgrade: route.upgrade,
      patterns: route.pattern ? route.pattern.extract() : null,
      middleware:
        route.middleware.length === 0
          ? null
          : route.middleware.length === 1
          ? route.middleware[0]
          : compose(...route.middleware),
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
          const pattern = Chemin.create(...patterns.filter(Chemin.isChemin));
          const exact = route.exact || childRoute.exact;
          const method = combineMethods(route.method, childRoute.method, (m) => {
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
    .filter((route) => {
      if (route.middleware.length === 0) {
        console.warn(
          `Route ${route.pattern === null ? 'null' : route.pattern.serialize()} has no middleware, it will be ignored`
        );
        return false;
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
  childArr.forEach((m) => {
    if (parentArr.indexOf(m) >= 0) {
      common.push(m);
    } else {
      onInvalid(m);
    }
  });
  return common;
}

export interface FindResult {
  route: RouteResolved;
  index: number;
  params: { [key: string]: any };
}

// fins all routes matching the pattern (ignoring methods & upgrade)
function find(routes: Array<RouteResolved>, pathname: string): Array<FindResult> {
  const parts = splitPathname(pathname);
  return routes
    .map((route, index): FindResult | false => {
      if (route.pattern === null) {
        return {
          route,
          index,
          params: {},
        };
      }
      const match = route.pattern.match(parts);

      if (match === false) {
        return false;
      }
      if (route.exact && match.rest.length > 0) {
        return false;
      }
      return {
        index,
        route: route,
        params: match.params,
      };
    })
    .filter((result: FindResult | false): result is FindResult => {
      return result !== false;
    });
}

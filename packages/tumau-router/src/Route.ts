import { Middleware, HttpMethod } from '@tumau/core';
import { RouterCtx, Params } from './RouterCtx';
import { RouteToRegexp } from './RouteToRegexp';

const ROUTE_TOKEN = Symbol('ROUTE_TOKEN');

type Method = null | HttpMethod | Array<HttpMethod>;

export interface Route<Ctx extends RouterCtx> {
  [ROUTE_TOKEN]: true;
  pattern: string | null;
  exact: boolean;
  middleware: Array<Middleware<Ctx>>;
  method: Method;
  children: Array<Route<Ctx>>;
}

export interface RouteResolved<Ctx extends RouterCtx> {
  [ROUTE_TOKEN]: true;
  pattern: string | null;
  exact: boolean;
  middleware: null | Middleware<Ctx>;
  method: Method;
  children: Array<Route<Ctx>>;
}

export type Routes<Ctx extends RouterCtx> = Array<Route<Ctx>>;

export interface FindResult<Ctx extends RouterCtx> {
  params: Params;
  route: RouteResolved<Ctx>;
  index: number;
}

const withMethod = (method: Method) => <Ctx extends RouterCtx>(
  pattern: string | null,
  ...middleware: Array<Middleware<Ctx>>
) => createRoute({ method, pattern }, middleware);

export const Route = {
  flatten: flattenAllRoutes,
  create: createRoute,
  find,
  GET: withMethod(HttpMethod.GET),
  POST: withMethod(HttpMethod.POST),
  PUT: withMethod(HttpMethod.PUT),
  DELETE: withMethod(HttpMethod.DELETE),
  PATCH: withMethod(HttpMethod.PATCH),
  all: withMethod(HttpMethod.PATCH),
  namespace: <Ctx extends RouterCtx>(pattern: string | null, routes: Routes<Ctx>) =>
    createRoute({ method: null, pattern, exact: false }, null, routes),
};

interface RouteOptions {
  method?: Method;
  pattern?: string | null;
  exact?: boolean;
}

function createRoute<Ctx extends RouterCtx>(
  options: RouteOptions,
  middleware: null | Middleware<Ctx> | Array<Middleware<Ctx>>,
  children: Routes<Ctx> = []
): Route<Ctx> {
  const { exact = true, method = null, pattern = null } = options;
  return {
    [ROUTE_TOKEN]: true,
    pattern,
    exact,
    middleware: resolveMiddleware(middleware),
    method,
    children,
  };
}

function resolveMiddleware<Ctx extends RouterCtx>(
  middleware: null | Middleware<Ctx> | Array<Middleware<Ctx>>
): Array<Middleware<Ctx>> {
  if (middleware === null) {
    return [];
  }
  if (Array.isArray(middleware)) {
    return middleware;
  }
  return [middleware];
}

function find<Ctx extends RouterCtx>(routes: Array<RouteResolved<Ctx>>, pathname: string): Array<FindResult<Ctx>> {
  return routes
    .map((route, index): FindResult<Ctx> | false => {
      if (route.pattern === null) {
        return {
          params: {},
          route,
          index,
        };
      }
      const { keys, regexp } = RouteToRegexp.parse(route.pattern, route.exact);
      const isDynamicRoute = keys.length > 0;
      if (isDynamicRoute) {
        const matches = regexp.exec(pathname);
        if (matches === null) {
          return false;
        }
        const params: Params = {};
        keys.forEach((key, index): void => {
          params[key] = matches[index];
        });
        return {
          params,
          route,
          index,
        };
      } else if (regexp.test(pathname)) {
        return {
          params: {},
          route,
          index,
        };
      }
      return false;
    })
    .filter((result: FindResult<Ctx> | false): result is FindResult<Ctx> => {
      return result !== false;
    });
}

function flattenAllRoutes<Ctx extends RouterCtx>(routes: Routes<Ctx>): Array<RouteResolved<Ctx>> {
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
function flattenRoutes<Ctx extends RouterCtx>(routes: Routes<Ctx>): Array<Route<Ctx>> {
  function flattenSingle(route: Route<Ctx>): Routes<Ctx> {
    if (route.children.length === 0) {
      return [route];
    }
    const parentMiddleware = route.middleware;
    return flattenRoutes(
      route.children
        .map((childRoute): Route<Ctx> | null => {
          const middlewares = [...parentMiddleware, ...childRoute.middleware];
          const patterns = [route.pattern, childRoute.pattern];
          if (childRoute.pattern && route.exact) {
            console.warn(
              `Error: ${route.pattern} is expected to be exact but its children ${childRoute.pattern} has a pattern, the child pattern will be ignored`
            );
            patterns[1] = null;
          }
          const pattern = patterns.filter((v: string | null): v is string => v !== null).join('');
          const exact = route.exact || childRoute.exact;
          const method = combineMethods(route.method, childRoute.method, m => {
            console.warn(
              `Error: in ${route.pattern} > ${route.pattern} the Method ${m} is not allowed by parent. It will be ignored !`
            );
          });
          return createRoute({ pattern, exact, method }, middlewares, childRoute.children);
        })
        .filter((r: Route<Ctx> | null): r is Route<Ctx> => r !== null)
    );
  }

  return routes
    .reduce<Routes<Ctx>>((acc, route) => {
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

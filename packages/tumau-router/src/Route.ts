import { Middleware, HttpMethod } from '@tumau/core';
import { RouterCtx, Params } from './RouterCtx';
import { RouteToRegexp } from './RouteToRegexp';

const ROUTE_TOKEN = Symbol('ROUTE_TOKEN');

type Method = null | HttpMethod | Array<HttpMethod>;

export interface Route<Ctx extends RouterCtx> {
  [ROUTE_TOKEN]: true;
  pattern: string;
  exact: boolean;
  middleware: Middleware<Ctx>;
  method: Method;
}

export interface FindResult<Ctx extends RouterCtx> {
  params: Params;
  route: Route<Ctx>;
  index: number;
}

const withMethod = (method: Method) => <Ctx extends RouterCtx>(route: string | null, middleware: Middleware<Ctx>) =>
  createRoute({ method, route }, middleware);

export const Route = {
  create: createRoute,
  find,
  GET: withMethod(HttpMethod.GET),
  POST: withMethod(HttpMethod.POST),
  PUT: withMethod(HttpMethod.PUT),
  DELETE: withMethod(HttpMethod.DELETE),
  PATCH: withMethod(HttpMethod.PATCH),
  all: withMethod(HttpMethod.PATCH),
  namespace: <Ctx extends RouterCtx>(route: string | null, middleware: Middleware<Ctx>) =>
    createRoute({ method: null, route, exact: false }, middleware),
};

interface RouteOptions {
  method?: Method;
  route?: string | null;
  exact?: boolean;
}

function createRoute<Ctx extends RouterCtx>(options: RouteOptions, middleware: Middleware<Ctx>): Route<Ctx> {
  const { exact = true, method = null, route = null } = options;
  const pattern = route === null ? '/*?' : route;
  return {
    [ROUTE_TOKEN]: true,
    pattern,
    exact,
    middleware,
    method,
  };
}

function find<Ctx extends RouterCtx>(routes: Array<Route<Ctx>>, startIndex: number, ctx: Ctx): FindResult<Ctx> | false {
  const parent = ctx.router && ctx.router.pattern ? ctx.router.pattern : null;

  const searchArray = routes.slice(startIndex);
  const parsedUrl = notNill(ctx.parsedUrl);

  return searchArray.reduce<FindResult<Ctx> | false>((found, route, index): FindResult<Ctx> | false => {
    if (found) {
      return found;
    }
    const method = route.method;
    const methodMatch =
      method === null ||
      (Array.isArray(method) ? method.indexOf(ctx.request.method) > -1 : method === ctx.request.method);
    if (methodMatch !== true) {
      return false;
    }

    const patternWithParent = parent ? parent + route.pattern : route.pattern;
    const { keys, regexp } = RouteToRegexp.parse(patternWithParent, route.exact);
    const isDynamicRoute = keys.length > 0;
    if (isDynamicRoute) {
      const matches = regexp.exec(parsedUrl.pathname);
      if (matches === null) {
        return false;
      }
      const params: Params = {};
      keys.forEach((key, index): void => {
        params[key] = notNill(matches)[index];
      });
      return {
        params,
        route,
        index,
      };
    } else if (regexp.test(parsedUrl.pathname)) {
      return {
        params: {},
        route,
        index,
      };
    }
    return false;
  }, false);
}

function notNill<T>(maybe: T | undefined | null): T {
  if (maybe === null || maybe === undefined) {
    throw Error(`Unexpected nill`);
  }
  return maybe;
}

import { Middleware, Request, Context, HttpErrors } from '@tumau/core';
import { RouterRequest } from './RouterRequest';
import { RouterContext } from './RouterContext';
import { notNill } from './utils';

interface ParseResult {
  keys: Array<string>;
  regexp: RegExp;
}

export type RouterMiddleware = Middleware<RouterContext>;
export type RouterMiddlewares = Array<RouterMiddleware>;

interface Options {
  onNotFound?: RouterMiddleware;
}

export type Router = Middleware<Context | RouterContext>;

const ROUTE_TOKEN = Symbol('ROUTE_TOKEN');

export interface Route {
  [ROUTE_TOKEN]: true;
  keys: Array<string>;
  regexp: RegExp;
  pattern: string;
  exact: boolean;
  middleware: RouterMiddleware;
}

export interface Params {
  [key: string]: string;
}

export interface FindResult {
  params: Params;
  route: Route;
  index: number;
}

export const Router = {
  parseRoute,
  create: createRouter,
  createRoute: (route: string, middleware: RouterMiddleware): Route => createRoute(route, true, middleware),
};

function createRoute(route: string, exact: boolean, middleware: RouterMiddleware): Route {
  const { keys, regexp } = parseRoute(route, exact);
  return {
    [ROUTE_TOKEN]: true,
    keys,
    pattern: route,
    regexp,
    exact,
    middleware,
  };
}

async function defaultOnNotFound(): Promise<void> {
  throw new HttpErrors.NotFound();
}

function parseRoute(str: string, exact: boolean = true): ParseResult {
  var c: string,
    o: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tmp: any,
    ext: number,
    keys = [],
    pattern = '',
    arr = str.split('/');
  arr[0] || arr.shift();

  while ((tmp = arr.shift())) {
    c = tmp[0];
    if (c === '*') {
      keys.push('wild');
      pattern += '/(.*)';
    } else if (c === ':') {
      o = tmp.indexOf('?', 1);
      ext = tmp.indexOf('.', 1);
      keys.push(tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length));
      pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
      if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    } else {
      pattern += '/' + tmp;
    }
  }

  return {
    keys: keys,
    regexp: new RegExp('^' + pattern + (exact ? '/?$' : '(?:$|/)'), 'i'),
  };
}

function createRouter(routes: Array<Route>, options: Options = {}): Router {
  const onNotFound: RouterMiddleware = options.onNotFound || defaultOnNotFound;

  const router: Router = async (ctx, next): Promise<void> => {
    async function handleNext(startIndex: number): Promise<void> {
      const findResult = find(startIndex, ctx.request);
      const routerRequest = await RouterRequest.create(ctx.request, findResult, onNotFound);
      const routerCtx = await RouterContext.create(ctx, routerRequest);
      return routerRequest.middleware(
        routerCtx,
        (): Promise<void> => {
          if (findResult) {
            return handleNext(findResult.index + 1);
          }
          return next();
        }
      );
    }

    return handleNext(0);
  };

  return router;

  function find(startIndex: number, request: Request | RouterRequest): FindResult | false {
    const parent = RouterRequest.isRouterRequest(request) ? request.parentRoutePattern : null;

    const routesWithParent = parent
      ? routes.map((route): Route => createRoute(parent + route.pattern, route.exact, route.middleware))
      : routes;

    const searchArray = routesWithParent.slice(startIndex);

    return searchArray.reduce<FindResult | false>((found, route, index): FindResult | false => {
      if (found) {
        return found;
      }
      const isDynamicRoute = route.keys.length > 0;
      if (isDynamicRoute) {
        const matches = route.regexp.exec(request.pathname);
        if (matches === null) {
          return false;
        }
        const params: Params = {};
        route.keys.forEach((key, index): void => {
          params[key] = notNill(matches)[index];
        });
        return {
          params,
          route,
          index,
        };
      } else if (route.regexp.test(request.pathname)) {
        return {
          params: {},
          route,
          index,
        };
      }
      return false;
    }, false);
  }
}

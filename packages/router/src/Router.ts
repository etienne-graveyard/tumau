import http from 'http';
import { HTTPMethod, Middleware, Next, Request, Context } from '../../tumau/pkg/dist-types';
import { RouterRequest } from './RouterRequest';
import { RouterContext } from './RouterContext';

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
  keys: Array<string>;
  regexp: RegExp;
  pattern: string;
  method: HTTPMethod;
  exact: boolean;
  middleware: RouterMiddleware;
  [ROUTE_TOKEN]: true;
}

export type Params = { [key: string]: string };

export interface FindResult {
  params: Params;
  route: Route;
}

export const Router = {
  parseRoute,
  create: createRouter,
  use: (route: string, middleware: RouterMiddleware): Route => createRoute(HTTPMethod.ALL, route, false, middleware),
  add: (method: HTTPMethod, route: string, middleware: RouterMiddleware): Route =>
    createRoute(method, route, true, middleware),
  all: (route: string, middleware: RouterMiddleware): Route => createRoute(HTTPMethod.ALL, route, true, middleware),
  get: (route: string, middleware: RouterMiddleware): Route => createRoute(HTTPMethod.ALL, route, true, middleware),
  head: (route: string, middleware: RouterMiddleware): Route => createRoute(HTTPMethod.ALL, route, true, middleware),
  patch: (route: string, middleware: RouterMiddleware): Route => createRoute(HTTPMethod.ALL, route, true, middleware),
  options: (route: string, middleware: RouterMiddleware): Route => createRoute(HTTPMethod.ALL, route, true, middleware),
  connect: (route: string, middleware: RouterMiddleware): Route => createRoute(HTTPMethod.ALL, route, true, middleware),
  delete: (route: string, middleware: RouterMiddleware): Route => createRoute(HTTPMethod.ALL, route, true, middleware),
  trace: (route: string, middleware: RouterMiddleware): Route => createRoute(HTTPMethod.ALL, route, true, middleware),
  post: (route: string, middleware: RouterMiddleware): Route => createRoute(HTTPMethod.ALL, route, true, middleware),
  put: (route: string, middleware: RouterMiddleware): Route => createRoute(HTTPMethod.ALL, route, true, middleware),
};

function createRoute(method: HTTPMethod, route: string, exact: boolean, middleware: RouterMiddleware): Route {
  const { keys, regexp } = parseRoute(route, exact);
  return {
    [ROUTE_TOKEN]: true,
    keys,
    method,
    pattern: route,
    regexp,
    exact,
    middleware,
  };
}

async function defaultOnNotFound(ctx: RouterContext) {
  return ctx.response.send({
    code: 404,
    json: {
      message: http.STATUS_CODES[404],
    },
  });
}

function parseRoute(str: string, exact: boolean = true): ParseResult {
  var c: string,
    o: number,
    tmp: string | any[],
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

  const router: Router = async (ctx, next) => {
    const findResult = find(ctx.request);
    const routerRequest = await RouterRequest.create(ctx.request, findResult, onNotFound);
    const routerCtx = await RouterContext.create(ctx, routerRequest);
    return routerRequest.middleware(routerCtx, next);
  };

  return router;

  function find(request: Request | RouterRequest): FindResult | false {
    const method = request.method;
    const parent = RouterRequest.isRouterRequest(request) ? request.parentRoutePattern : null;

    const routesWithParent = parent
      ? routes.map(route => createRoute(route.method, parent + route.pattern, route.exact, route.middleware))
      : routes;

    let isHEAD = method === HTTPMethod.HEAD;
    return routesWithParent.reduce<FindResult | false>((found, route) => {
      if (found) {
        return found;
      }
      if (route.method === HTTPMethod.ALL || route.method === method || (isHEAD && route.method === HTTPMethod.GET)) {
        const isDynamicRoute = route.keys.length > 0;
        if (isDynamicRoute) {
          const matches = route.regexp.exec(request.pathname);
          if (matches === null) {
            return false;
          }
          const params: Params = {};
          route.keys.forEach((key, index) => {
            params[key] = matches![index];
          });
          return {
            params,
            route,
          };
        } else if (route.regexp.test(request.pathname)) {
          return {
            params: {},
            route,
          };
        }
      }
      return false;
    }, false);
  }
}

import { Middleware, BaseContext, Result } from '@tumau/core';
import { UrlParserCtx, UrlParser } from '@tumau/url-parser';

interface ParseResult {
  keys: Array<string>;
  regexp: RegExp;
}

interface RouterData {
  params: Params;
  middleware: Middleware<RouterCtx> | null;
  notFound: boolean;
  pattern: string;
}

export interface RouterCtx extends BaseContext, UrlParserCtx {
  router?: RouterData;
}

const ROUTE_TOKEN = Symbol('ROUTE_TOKEN');

export interface Route<Ctx extends RouterCtx> {
  [ROUTE_TOKEN]: true;
  keys: Array<string>;
  regexp: RegExp;
  pattern: string;
  exact: boolean;
  middleware: Middleware<Ctx>;
}

export interface Params {
  [key: string]: string;
}

export interface FindResult<Ctx extends RouterCtx> {
  params: Params;
  route: Route<Ctx>;
  index: number;
}

export const Router = {
  parseRoute,
  create: createRouter,

  createRouteGroup: <Ctx extends RouterCtx>(route: string | null, middleware: Middleware<Ctx>): Route<Ctx> =>
    createRoute<Ctx>(route, false, middleware),
  createRoute: <Ctx extends RouterCtx>(route: string | null, middleware: Middleware<Ctx>): Route<Ctx> =>
    createRoute<Ctx>(route, true, middleware),
};

function createRoute<Ctx extends RouterCtx>(
  route: string | null,
  exact: boolean,
  middleware: Middleware<Ctx>
): Route<Ctx> {
  const pattern = route === null ? '/*?' : route;
  const { keys, regexp } = parseRoute(pattern, exact);
  return {
    [ROUTE_TOKEN]: true,
    keys,
    pattern,
    regexp,
    exact,
    middleware,
  };
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
    if (tmp === '*') {
      keys.push('wild');
      pattern += '/(.*)';
    } else if (tmp === '*?') {
      keys.push('wild');
      pattern += '(\\/(?:.*))?';
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

function createRouter<Ctx extends RouterCtx>(routes: Array<Route<Ctx>>): Middleware<Ctx> {
  const router: Middleware<Ctx> = async (inCtx, next): Promise<Result<Ctx>> => {
    async function handleNext(startIndex: number, ctx: Ctx): Promise<Result<Ctx>> {
      const findResult = find(routes, startIndex, ctx);

      const routeMiddleware = findResult ? findResult.route.middleware : null;
      const pattern = findResult ? findResult.route.pattern : '';
      const composedPattern = ctx.router ? ctx.router.pattern + pattern : pattern;

      const nextCtx: Ctx = {
        ...ctx,
        router: {
          middleware: routeMiddleware,
          pattern: composedPattern,
          notFound: findResult === false,
          params: findResult ? findResult.params : {},
        },
      };

      if (findResult) {
        // found a match, run it's middleware
        const result = await findResult.route.middleware(
          nextCtx,
          (ctx: RouterCtx): Promise<Result<Ctx>> => {
            return next(ctx as any);
          }
        );

        // If the match did not return a response search the next match
        if (result.response === null) {
          return handleNext(findResult.index + 1, ctx as any);
        }

        // return the response
        return result;
      }

      // no match, run next
      return next(nextCtx);
    }

    return handleNext(0, inCtx);
  };

  return Middleware.compose(
    UrlParser(),
    router
  );
}

function find<Ctx extends RouterCtx>(routes: Array<Route<Ctx>>, startIndex: number, ctx: Ctx): FindResult<Ctx> | false {
  const parent = ctx.router && ctx.router.pattern ? ctx.router.pattern : null;

  const routesWithParent = parent
    ? routes.map((route): Route<Ctx> => createRoute(parent + route.pattern, route.exact, route.middleware))
    : routes;

  const searchArray = routesWithParent.slice(startIndex);

  const urlParser = notNill(ctx.parsedUrl);

  return searchArray.reduce<FindResult<Ctx> | false>((found, route, index): FindResult<Ctx> | false => {
    if (found) {
      return found;
    }
    const isDynamicRoute = route.keys.length > 0;
    if (isDynamicRoute) {
      const matches = route.regexp.exec(urlParser.pathname);
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
    } else if (route.regexp.test(urlParser.pathname)) {
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

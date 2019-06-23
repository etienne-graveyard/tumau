'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@tumau/core');

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

const RouterRequest = {
  create: createRouterRequest,
  isRouterRequest
};

async function createRouterRequest(request, find, noMatch) {
  const middleware = find ? find.route.middleware : noMatch;
  const pattern = find ? find.route.pattern : '';
  const parentRoutePattern = isRouterRequest(request) ? request.parentRoutePattern + pattern : pattern;

  const routerRequest = _objectSpread({}, request, {
    params: find ? find.params : {},
    middleware,
    notFound: find === false,
    parentRoutePattern
  });

  return routerRequest;
}

function isRouterRequest(request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!request.middleware;
}

const RouterContext = {
  create: createRouterContext
};

async function createRouterContext(parentCtx, routerRequest) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const other = _objectWithoutProperties(parentCtx, ["request"]);

  const ctx = _objectSpread({}, other, {
    request: routerRequest
  });

  return ctx;
}

function notNill(maybe) {
  if (maybe === null || maybe === undefined) {
    throw Error(`Unexpected nill`);
  }

  return maybe;
}

const ROUTE_TOKEN = Symbol('ROUTE_TOKEN');
const Router = {
  parseRoute,
  create: createRouter,
  createRoute: (route, middleware) => createRoute(route, true, middleware)
};

function createRoute(route, exact, middleware) {
  const {
    keys,
    regexp
  } = parseRoute(route, exact);
  return {
    [ROUTE_TOKEN]: true,
    keys,
    pattern: route,
    regexp,
    exact,
    middleware
  };
}

async function defaultOnNotFound() {
  throw new core.HttpErrors.NotFound();
}

function parseRoute(str, exact = true) {
  var c,
      o,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tmp,
      ext,
      keys = [],
      pattern = '',
      arr = str.split('/');
  arr[0] || arr.shift();

  while (tmp = arr.shift()) {
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
    regexp: new RegExp('^' + pattern + (exact ? '/?$' : '(?:$|/)'), 'i')
  };
}

function createRouter(routes, options = {}) {
  const onNotFound = options.onNotFound || defaultOnNotFound;

  const router = async (ctx, next) => {
    async function handleNext(startIndex) {
      const findResult = find(startIndex, ctx.request);
      const routerRequest = await RouterRequest.create(ctx.request, findResult, onNotFound);
      const routerCtx = await RouterContext.create(ctx, routerRequest);
      return routerRequest.middleware(routerCtx, () => {
        if (findResult) {
          return handleNext(findResult.index + 1);
        }

        return next();
      });
    }

    return handleNext(0);
  };

  return router;

  function find(startIndex, request) {
    const parent = RouterRequest.isRouterRequest(request) ? request.parentRoutePattern : null;
    const routesWithParent = parent ? routes.map(route => createRoute(parent + route.pattern, route.exact, route.middleware)) : routes;
    const searchArray = routesWithParent.slice(startIndex);
    return searchArray.reduce((found, route, index) => {
      if (found) {
        return found;
      }

      const isDynamicRoute = route.keys.length > 0;

      if (isDynamicRoute) {
        const matches = route.regexp.exec(request.pathname);

        if (matches === null) {
          return false;
        }

        const params = {};
        route.keys.forEach((key, index) => {
          params[key] = notNill(matches)[index];
        });
        return {
          params,
          route,
          index
        };
      } else if (route.regexp.test(request.pathname)) {
        return {
          params: {},
          route,
          index
        };
      }

      return false;
    }, false);
  }
}

exports.Router = Router;
exports.RouterContext = RouterContext;
exports.RouterRequest = RouterRequest;

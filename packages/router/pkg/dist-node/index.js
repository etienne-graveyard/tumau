'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var http = _interopDefault(require('http'));
var core = require('@tumau/core');

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

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

function createRouterRequest(request, find, noMatch) {
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
  return !!request.middleware;
}

const RouterContext = {
  create: createRouterContext
};

function createRouterContext(parentCtx, routerRequest) {
  const request = parentCtx.request,
        other = _objectWithoutProperties(parentCtx, ["request"]);

  const ctx = _objectSpread({}, other, {
    request: routerRequest
  });

  return ctx;
}

const ROUTE_TOKEN = Symbol('ROUTE_TOKEN');
const Router = {
  parseRoute,
  create: createRouter,
  use: (route, middleware) => createRoute(core.HTTPMethod.ALL, route, false, middleware),
  add: (method, route, middleware) => createRoute(method, route, true, middleware),
  all: (route, middleware) => createRoute(core.HTTPMethod.ALL, route, true, middleware),
  get: (route, middleware) => createRoute(core.HTTPMethod.ALL, route, true, middleware),
  head: (route, middleware) => createRoute(core.HTTPMethod.ALL, route, true, middleware),
  patch: (route, middleware) => createRoute(core.HTTPMethod.ALL, route, true, middleware),
  options: (route, middleware) => createRoute(core.HTTPMethod.ALL, route, true, middleware),
  connect: (route, middleware) => createRoute(core.HTTPMethod.ALL, route, true, middleware),
  delete: (route, middleware) => createRoute(core.HTTPMethod.ALL, route, true, middleware),
  trace: (route, middleware) => createRoute(core.HTTPMethod.ALL, route, true, middleware),
  post: (route, middleware) => createRoute(core.HTTPMethod.ALL, route, true, middleware),
  put: (route, middleware) => createRoute(core.HTTPMethod.ALL, route, true, middleware)
};

function createRoute(method, route, exact, middleware) {
  const _parseRoute = parseRoute(route, exact),
        keys = _parseRoute.keys,
        regexp = _parseRoute.regexp;

  return {
    [ROUTE_TOKEN]: true,
    keys,
    method,
    pattern: route,
    regexp,
    exact,
    middleware
  };
}

function defaultOnNotFound(_x, _x2) {
  return _defaultOnNotFound.apply(this, arguments);
}

function _defaultOnNotFound() {
  _defaultOnNotFound = _asyncToGenerator(function* (ctx, _next) {
    // TODO:
    const _ctx$request = ctx.request,
          href = _ctx$request.href,
          method = _ctx$request.method,
          params = _ctx$request.params,
          path = _ctx$request.path,
          pathname = _ctx$request.pathname;
    console.log({
      href,
      method,
      params,
      path,
      pathname
    });
    return ctx.response.send({
      code: 404,
      json: {
        message: http.STATUS_CODES[404]
      }
    });
  });
  return _defaultOnNotFound.apply(this, arguments);
}

function parseRoute(str, exact = true) {
  var c,
      o,
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

  const router =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(function* (ctx, next) {
      const findResult = find(ctx.request);
      const routerRequest = RouterRequest.create(ctx.request, findResult, onNotFound);
      const routerCtx = RouterContext.create(ctx, routerRequest);
      return routerRequest.middleware(routerCtx, next);
    });

    return function router(_x3, _x4) {
      return _ref.apply(this, arguments);
    };
  }();

  return router;

  function find(request) {
    const method = request.method;
    const parent = RouterRequest.isRouterRequest(request) ? request.parentRoutePattern : null;
    const routesWithParent = parent ? routes.map(route => createRoute(route.method, parent + route.pattern, route.exact, route.middleware)) : routes;
    let isHEAD = method === core.HTTPMethod.HEAD;
    return routesWithParent.reduce((found, route) => {
      if (found) {
        return found;
      }

      if (route.method === core.HTTPMethod.ALL || route.method === method || isHEAD && route.method === core.HTTPMethod.GET) {
        const isDynamicRoute = route.keys.length > 0;

        if (isDynamicRoute) {
          const matches = route.regexp.exec(request.pathname);

          if (matches === null) {
            return false;
          }

          const params = {};
          route.keys.forEach((key, index) => {
            params[key] = matches[index];
          });
          return {
            params,
            route
          };
        } else if (route.regexp.test(request.pathname)) {
          return {
            params: {},
            route
          };
        }
      }

      return false;
    }, false);
  }
}

exports.Router = Router;
exports.RouterContext = RouterContext;
exports.RouterRequest = RouterRequest;

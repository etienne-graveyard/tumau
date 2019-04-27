import http from 'http';
import { HTTPMethod } from '@tumau/core';
import { RouterRequest } from './RouterRequest';
import { RouterContext } from './RouterContext';
const ROUTE_TOKEN = Symbol('ROUTE_TOKEN');
export const Router = {
    parseRoute,
    create: createRouter,
    use: (route, middleware) => createRoute(HTTPMethod.ALL, route, false, middleware),
    add: (method, route, middleware) => createRoute(method, route, true, middleware),
    all: (route, middleware) => createRoute(HTTPMethod.ALL, route, true, middleware),
    get: (route, middleware) => createRoute(HTTPMethod.ALL, route, true, middleware),
    head: (route, middleware) => createRoute(HTTPMethod.ALL, route, true, middleware),
    patch: (route, middleware) => createRoute(HTTPMethod.ALL, route, true, middleware),
    options: (route, middleware) => createRoute(HTTPMethod.ALL, route, true, middleware),
    connect: (route, middleware) => createRoute(HTTPMethod.ALL, route, true, middleware),
    delete: (route, middleware) => createRoute(HTTPMethod.ALL, route, true, middleware),
    trace: (route, middleware) => createRoute(HTTPMethod.ALL, route, true, middleware),
    post: (route, middleware) => createRoute(HTTPMethod.ALL, route, true, middleware),
    put: (route, middleware) => createRoute(HTTPMethod.ALL, route, true, middleware),
};
function createRoute(method, route, exact, middleware) {
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
async function defaultOnNotFound(ctx, _next) {
    // TODO:
    const { href, method, params, path, pathname } = ctx.request;
    console.log({ href, method, params, path, pathname });
    return ctx.response.send({
        code: 404,
        json: {
            message: http.STATUS_CODES[404],
        },
    });
}
function parseRoute(str, exact = true) {
    var c, o, tmp, ext, keys = [], pattern = '', arr = str.split('/');
    arr[0] || arr.shift();
    while ((tmp = arr.shift())) {
        c = tmp[0];
        if (c === '*') {
            keys.push('wild');
            pattern += '/(.*)';
        }
        else if (c === ':') {
            o = tmp.indexOf('?', 1);
            ext = tmp.indexOf('.', 1);
            keys.push(tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length));
            pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
            if (!!~ext)
                pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
        }
        else {
            pattern += '/' + tmp;
        }
    }
    return {
        keys: keys,
        regexp: new RegExp('^' + pattern + (exact ? '/?$' : '(?:$|/)'), 'i'),
    };
}
function createRouter(routes, options = {}) {
    const onNotFound = options.onNotFound || defaultOnNotFound;
    const router = async (ctx, next) => {
        const findResult = find(ctx.request);
        const routerRequest = RouterRequest.create(ctx.request, findResult, onNotFound);
        const routerCtx = RouterContext.create(ctx, routerRequest);
        return routerRequest.middleware(routerCtx, next);
    };
    return router;
    function find(request) {
        const method = request.method;
        const parent = RouterRequest.isRouterRequest(request) ? request.parentRoutePattern : null;
        const routesWithParent = parent
            ? routes.map(route => createRoute(route.method, parent + route.pattern, route.exact, route.middleware))
            : routes;
        let isHEAD = method === HTTPMethod.HEAD;
        return routesWithParent.reduce((found, route) => {
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
                    const params = {};
                    route.keys.forEach((key, index) => {
                        params[key] = matches[index];
                    });
                    return {
                        params,
                        route,
                    };
                }
                else if (route.regexp.test(request.pathname)) {
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

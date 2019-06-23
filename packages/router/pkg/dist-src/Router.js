import { HttpErrors } from '@tumau/core';
import { RouterRequest } from './RouterRequest';
import { RouterContext } from './RouterContext';
import { notNill } from './utils';
const ROUTE_TOKEN = Symbol('ROUTE_TOKEN');
export const Router = {
    parseRoute,
    create: createRouter,
    createRoute: (route, middleware) => createRoute(route, true, middleware),
};
function createRoute(route, exact, middleware) {
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
async function defaultOnNotFound() {
    throw new HttpErrors.NotFound();
}
function parseRoute(str, exact = true) {
    var c, o, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tmp, ext, keys = [], pattern = '', arr = str.split('/');
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
        const routesWithParent = parent
            ? routes.map((route) => createRoute(parent + route.pattern, route.exact, route.middleware))
            : routes;
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
                    index,
                };
            }
            else if (route.regexp.test(request.pathname)) {
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

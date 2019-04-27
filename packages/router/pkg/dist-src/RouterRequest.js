export const RouterRequest = {
    create: createRouterRequest,
    isRouterRequest,
};
function createRouterRequest(request, find, noMatch) {
    const middleware = find ? find.route.middleware : noMatch;
    const pattern = find ? find.route.pattern : '';
    const parentRoutePattern = isRouterRequest(request) ? request.parentRoutePattern + pattern : pattern;
    const routerRequest = {
        ...request,
        params: find ? find.params : {},
        middleware,
        notFound: find === false,
        parentRoutePattern,
    };
    return routerRequest;
}
function isRouterRequest(request) {
    return !!request.middleware;
}

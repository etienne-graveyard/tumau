export const RouterContext = {
    create: createRouterContext,
};
function createRouterContext(parentCtx, routerRequest) {
    const { request, ...other } = parentCtx;
    const ctx = {
        ...other,
        request: routerRequest,
    };
    return ctx;
}

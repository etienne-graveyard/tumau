export const RouterContext = {
    create: createRouterContext,
};
async function createRouterContext(parentCtx, routerRequest) {
    const { request, ...other } = parentCtx;
    const ctx = {
        ...other,
        request: routerRequest,
    };
    return ctx;
}

export const RouterContext = {
    create: createRouterContext,
};
async function createRouterContext(parentCtx, routerRequest) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { request, ...other } = parentCtx;
    const ctx = {
        ...other,
        request: routerRequest,
    };
    return ctx;
}

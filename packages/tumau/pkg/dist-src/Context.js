export const Context = {
    create: createContext,
};
function createContext(request, response) {
    const context = {
        request,
        response,
    };
    return context;
}

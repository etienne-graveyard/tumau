export const Context = {
    create: createContext,
};
async function createContext(request, response) {
    const context = {
        request,
        response,
    };
    return context;
}

export const Middleware = {
    compose,
};
function compose(...middlewares) {
    return async function (ctx, next) {
        // last called middleware #
        let index = -1;
        return dispatch(0);
        function dispatch(i) {
            if (i <= index) {
                return Promise.reject(new Error('next() called multiple times'));
            }
            index = i;
            let fn = middlewares[i];
            if (i === middlewares.length) {
                fn = next;
            }
            if (!fn) {
                return Promise.resolve();
            }
            try {
                return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)));
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
    };
}

import { HTTPMethod, Middleware, Context } from '../../tumau/pkg/dist-types';
import { RouterContext } from './RouterContext';
interface ParseResult {
    keys: Array<string>;
    regexp: RegExp;
}
export declare type RouterMiddleware = Middleware<RouterContext>;
export declare type RouterMiddlewares = Array<RouterMiddleware>;
interface Options {
    onNotFound?: RouterMiddleware;
}
export declare type Router = Middleware<Context | RouterContext>;
declare const ROUTE_TOKEN: unique symbol;
export interface Route {
    keys: Array<string>;
    regexp: RegExp;
    pattern: string;
    method: HTTPMethod;
    exact: boolean;
    middleware: RouterMiddleware;
    [ROUTE_TOKEN]: true;
}
export declare type Params = {
    [key: string]: string;
};
export interface FindResult {
    params: Params;
    route: Route;
}
export declare const Router: {
    parseRoute: typeof parseRoute;
    create: typeof createRouter;
    use: (route: string, middleware: Middleware<RouterContext>) => Route;
    add: (method: HTTPMethod, route: string, middleware: Middleware<RouterContext>) => Route;
    all: (route: string, middleware: Middleware<RouterContext>) => Route;
    get: (route: string, middleware: Middleware<RouterContext>) => Route;
    head: (route: string, middleware: Middleware<RouterContext>) => Route;
    patch: (route: string, middleware: Middleware<RouterContext>) => Route;
    options: (route: string, middleware: Middleware<RouterContext>) => Route;
    connect: (route: string, middleware: Middleware<RouterContext>) => Route;
    delete: (route: string, middleware: Middleware<RouterContext>) => Route;
    trace: (route: string, middleware: Middleware<RouterContext>) => Route;
    post: (route: string, middleware: Middleware<RouterContext>) => Route;
    put: (route: string, middleware: Middleware<RouterContext>) => Route;
};
declare function parseRoute(str: string, exact?: boolean): ParseResult;
declare function createRouter(routes: Array<Route>, options?: Options): Router;
export {};

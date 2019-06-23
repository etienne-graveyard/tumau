import { Middleware, Context } from '@tumau/core';
import { RouterContext } from './RouterContext';
interface ParseResult {
    keys: string[];
    regexp: RegExp;
}
export declare type RouterMiddleware = Middleware<RouterContext>;
export declare type RouterMiddlewares = RouterMiddleware[];
interface Options {
    onNotFound?: RouterMiddleware;
}
export declare type Router = Middleware<Context | RouterContext>;
declare const ROUTE_TOKEN: unique symbol;
export interface Route {
    [ROUTE_TOKEN]: true;
    keys: string[];
    regexp: RegExp;
    pattern: string;
    exact: boolean;
    middleware: RouterMiddleware;
}
export interface Params {
    [key: string]: string;
}
export interface FindResult {
    params: Params;
    route: Route;
    index: number;
}
export declare const Router: {
    parseRoute: typeof parseRoute;
    create: typeof createRouter;
    createRoute: (route: string, middleware: Middleware<RouterContext>) => Route;
};
declare function parseRoute(str: string, exact?: boolean): ParseResult;
declare function createRouter(routes: Route[], options?: Options): Router;
export {};

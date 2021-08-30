import { Chemin } from 'chemin';
import { HttpMethod, Middleware } from '../core';
export interface Route {
    pattern: Chemin | null;
    method: HttpMethod | null;
    exact: boolean;
    middleware: Middleware;
    isFallback: boolean;
}
export declare type Routes = Array<Route>;
export declare const Route: {
    find: typeof find;
    groupByPattern: typeof groupByPattern;
    create: typeof createRoute;
    GET: (pattern: Chemin, ...middleware: Array<Middleware>) => Route;
    POST: (pattern: Chemin, ...middleware: Array<Middleware>) => Route;
    PUT: (pattern: Chemin, ...middleware: Array<Middleware>) => Route;
    DELETE: (pattern: Chemin, ...middleware: Array<Middleware>) => Route;
    PATCH: (pattern: Chemin, ...middleware: Array<Middleware>) => Route;
    namespace: (pattern: Chemin | string, routes: Routes) => Routes;
    group: (middlewares: Middleware | Array<Middleware>, routes: Routes) => Routes;
    fallback: (...middlewares: Array<Middleware>) => Route;
};
declare function createRoute({ isFallback, method, pattern, exact, }: {
    isFallback?: boolean;
    pattern?: Chemin | null;
    method?: HttpMethod | null;
    exact?: boolean;
}, middleware: Middleware | Array<Middleware>): Route;
export interface FindResult {
    route: Route;
    index: number;
    params: {
        [key: string]: any;
    };
}
declare function find(routes: Array<Route>, pathname: string, method: HttpMethod | null): Array<FindResult>;
declare type GroupResult = {
    pattern: Chemin | null;
    routes: Routes;
};
declare function groupByPattern(routes: Array<Route>): Array<GroupResult>;
export {};

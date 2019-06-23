import { Request } from '@tumau/core';
import { Params, RouterMiddleware, FindResult } from './Router';
export interface RouterRequest extends Request {
    params: Params;
    middleware: RouterMiddleware;
    notFound: boolean;
    parentRoutePattern: string;
}
export declare const RouterRequest: {
    create: typeof createRouterRequest;
    isRouterRequest: typeof isRouterRequest;
};
declare function createRouterRequest(request: Request | RouterRequest, find: FindResult | false, noMatch: RouterMiddleware): Promise<RouterRequest>;
declare function isRouterRequest(request: Request | RouterRequest): request is RouterRequest;
export {};

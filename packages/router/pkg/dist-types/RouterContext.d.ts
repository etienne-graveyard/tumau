import { Context, Response } from '@tumau/core';
import { RouterRequest } from './RouterRequest';
export interface RouterContext extends Context<RouterRequest, Response> {
}
export declare const RouterContext: {
    create: typeof createRouterContext;
};
declare function createRouterContext(parentCtx: Context | RouterContext, routerRequest: RouterRequest): Promise<RouterContext>;
export {};

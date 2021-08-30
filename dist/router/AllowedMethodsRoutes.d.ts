import { HttpMethod, TumauResponse } from '../core';
import { Routes } from './Route';
export declare const RouterAllowedMethodsContext: import("miid/dist/Context").Context<Set<HttpMethod>, false>;
export declare const RouterAllowedMethodsConsumer: import("miid/dist/Context").ContextConsumer<Set<HttpMethod>, false>;
export declare class AllowedMethodsResponse extends TumauResponse {
    originalResponse: TumauResponse;
    allowedMethods: Set<HttpMethod>;
    constructor(originalResponse: TumauResponse, allowedMethods: Set<HttpMethod>);
}
export declare function AllowedMethodsRoutes(routes: Routes): Routes;

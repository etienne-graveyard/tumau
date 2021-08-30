import { TumauResponse, HttpMethod } from '../core';
export declare class AllowedMethodsResponse extends TumauResponse {
    originalResponse: TumauResponse;
    allowedMethods: Set<HttpMethod>;
    constructor(originalResponse: TumauResponse, allowedMethods: Set<HttpMethod>);
}

import { TumauResponse } from '../core';
import { SetCookies } from './Cookie';
export declare class CookieResponse extends TumauResponse {
    originalResponse: TumauResponse;
    constructor(originalResponse: TumauResponse, cookies: SetCookies);
    static buildSetCookieHeader(cookies: SetCookies): string | Array<string> | undefined;
    static fromResponse(originalResponse: TumauResponse, cookies: SetCookies): TumauResponse | CookieResponse;
}

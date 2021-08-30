import { Middleware } from '../core';
import { CreateCookieOptions } from './Cookie';
export interface CookieManager {
    set(name: string, value: string, options?: CreateCookieOptions): void;
    has(name: string): boolean;
    unset(name: string): void;
    delete(name: string, options?: CreateCookieOptions): void;
}
export declare const CookieManagerCtx: import("miid/dist/Context").Context<CookieManager, false>;
export declare const CookieManagerConsumer: import("miid/dist/Context").ContextConsumer<CookieManager, false>;
/**
 *
 */
export declare function CookieManager(): Middleware;

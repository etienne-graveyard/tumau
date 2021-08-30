import { Middleware } from '../core';
import { Cookies } from './Cookie';
export declare const CookieParserContext: import("miid/dist/Context").Context<Cookies, true>;
export declare const CookieParserConsumer: import("miid/dist/Context").ContextConsumer<Cookies, true>;
export declare function CookieParser(): Middleware;

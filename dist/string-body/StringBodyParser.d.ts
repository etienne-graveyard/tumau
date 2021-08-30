import { Middleware } from '../core';
interface Options {
    limit?: number;
}
export declare const StringBodyContext: import("miid/dist/Context").Context<string | null, false>;
export declare const StringBodyConsumer: import("miid/dist/Context").ContextConsumer<string | null, false>;
export declare function StringBodyParser(options?: Options): Middleware;
export {};

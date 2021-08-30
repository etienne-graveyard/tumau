declare type OriginMatcher = (requestOrigin: string | null | undefined) => boolean;
export declare function createOriginMatcher(allowedOrigins: Array<string | RegExp>): OriginMatcher;
export interface CorsActualConfig {
    allowOrigin?: Array<string | RegExp>;
    allowCredentials?: boolean;
    exposeHeaders?: Array<string>;
}
export interface CorsPreflightConfig extends CorsActualConfig {
    allowMethods?: Array<string>;
    allowHeaders?: Array<string>;
    maxAge?: number;
}
export interface CorsActualConfigResolved {
    allowOrigin: string;
    allowCredentials: boolean;
    exposeHeaders: Array<string>;
}
export interface CorsPreflightConfigResolved extends CorsActualConfigResolved {
    allowHeaders: Array<string> | null;
    allowMethods: Array<string> | null;
    maxAge: number | null;
}
export declare function createActualConfigResolver(config: CorsActualConfig): (origin: string | null | undefined) => CorsActualConfigResolved | false;
export declare function createPreflightConfigResolver(config: CorsPreflightConfig): (origin: string | null | undefined) => CorsPreflightConfigResolved | false;
export {};

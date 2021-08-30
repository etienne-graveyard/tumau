export declare const SameSite: {
    readonly Strict: "Strict";
    readonly Lax: "Lax";
    readonly None: "None";
};
export declare type SameSite = typeof SameSite[keyof typeof SameSite];
export interface SetCookie {
    name: string;
    value: string;
    expires?: Date;
    maxAge?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: SameSite;
}
export declare type SetCookies = Array<SetCookie>;
export declare type Cookies = {
    [name: string]: string | undefined;
};
export interface CreateCookieOptions {
    expires?: Date;
    maxAge?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: SameSite;
}
export declare const SetCookie: {
    toString: typeof toString;
    create: typeof createCookie;
    delete: typeof deleteCookie;
};
export declare const Cookies: {
    parse: typeof parseCookies;
};
declare function parseCookies(cookiesStr: string): Cookies;
declare function createCookie(name: string, value: string, options?: CreateCookieOptions): SetCookie;
declare function deleteCookie(name: string, options?: CreateCookieOptions): SetCookie;
declare function toString(name: string, cookie: SetCookie): string;
export {};

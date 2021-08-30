/// <reference types="node" />
import { ParsedUrlQuery } from 'querystring';
import { Middleware } from '../core';
export interface ParsedUrl {
    query: null | ParsedUrlQuery;
    search: null | string;
    path: string;
    pathname: string;
    rawQuery: null | string;
}
export declare const UrlParserContext: import("miid/dist/Context").Context<ParsedUrl, false>;
export declare const UrlParserConsumer: import("miid/dist/Context").ContextConsumer<ParsedUrl, false>;
export declare function UrlParser(): Middleware;
export interface ParsedUrlObj {
    query: null | string;
    search: null | string;
    href: string;
    path: string;
    pathname: string;
}

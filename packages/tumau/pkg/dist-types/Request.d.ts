/// <reference types="node" />
import { IncomingMessage, IncomingHttpHeaders } from 'http';
import { HttpMethod } from './HttpMethod';
import { ParsedUrlQuery } from 'querystring';
export interface Request {
    req: IncomingMessage;
    method: HttpMethod;
    query: null | ParsedUrlQuery;
    body: object;
    url: string;
    search: null | string;
    href: string;
    path: string;
    pathname: string;
    rawQuery: null | string;
    headers: IncomingHttpHeaders;
}
export interface ParsedUrl {
    _raw: string;
    query: null | string;
    search: null | string;
    href: string;
    path: string;
    pathname: string;
}
export declare const Request: {
    create: typeof createRequest;
    parseUrl: typeof parseUrl;
};
declare function createRequest(req: IncomingMessage): Promise<Request>;
declare function parseUrl(url: string): ParsedUrl;
export {};

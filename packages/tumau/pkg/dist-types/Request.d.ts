/// <reference types="node" />
import { IncomingMessage } from 'http';
import { HTTPMethod } from './HTTPMethod';
import { ParsedUrlQuery } from 'querystring';
export interface Request {
    req: IncomingMessage;
    method: HTTPMethod;
    query: null | ParsedUrlQuery;
    body: object;
    url: string;
    search: null | string;
    href: string;
    path: string;
    pathname: string;
    rawQuery: null | string;
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

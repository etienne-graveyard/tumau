/// <reference types="node" />
import { IncomingMessage } from 'http';
import { HTTPMethod } from './HTTPMethod';
import { ParsedUrlQuery } from 'querystring';
export interface ParsedUrl {
    _raw: string;
    query: null | string;
    search: null | string;
    href: string;
    path: string;
    pathname: string;
}
export interface Request {
    req: IncomingMessage;
    url: string;
    search: null | string;
    href: string;
    path: string;
    pathname: string;
    rawQuery: null | string;
    query: null | ParsedUrlQuery;
    method: HTTPMethod;
}
export declare const Request: {
    create: typeof createRequest;
    parseUrl: typeof parseUrl;
};
declare function createRequest(req: IncomingMessage): Request;
declare function parseUrl(url: string): ParsedUrl;
export {};

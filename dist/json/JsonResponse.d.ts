/// <reference types="node" />
import { TumauResponse, HttpStatusCode } from '../core';
import { OutgoingHttpHeaders } from 'http';
interface Options<T> {
    json: T;
    code?: HttpStatusCode;
    headers?: OutgoingHttpHeaders;
}
export declare class JsonResponse<T = any> extends TumauResponse {
    json: any;
    constructor(options: Options<T>);
    static withJson<T extends unknown>(json: T): JsonResponse;
    static fromError(err: unknown, debug: boolean): JsonResponse;
    static fromResponse(res: unknown, debug: boolean): JsonResponse | TumauResponse;
}
export {};

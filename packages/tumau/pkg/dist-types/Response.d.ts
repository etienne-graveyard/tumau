/// <reference types="node" />
import http, { OutgoingHttpHeaders } from 'http';
import { HttpStatusCode } from './HttpStatus';
import { Context } from './Context';
export interface Response {
    res: http.ServerResponse;
    create(options?: SendOptions, config?: {
        force?: boolean;
    }): void;
    clearBody(): void;
    sent: boolean;
    __send(ctx: Context): void;
}
export declare const Response: {
    create: typeof createResponse;
};
interface SendOptions {
    code?: HttpStatusCode;
    json?: object | null;
    headers?: OutgoingHttpHeaders;
}
declare function createResponse(res: http.ServerResponse): Promise<Response>;
export {};

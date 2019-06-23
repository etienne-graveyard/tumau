/// <reference types="node" />
import http, { OutgoingHttpHeaders } from 'http';
export interface Response {
    res: http.ServerResponse;
    send(options?: SendOptions): void;
}
export declare const Response: {
    create: typeof createResponse;
};
interface SendOptions {
    code?: number;
    json?: object;
    headers?: OutgoingHttpHeaders;
}
declare function createResponse(res: http.ServerResponse): Promise<Response>;
export {};

/// <reference types="node" />
import { OutgoingHttpHeaders } from 'http';
import { HttpStatusCode } from './HttpStatus';
import { Readable } from 'stream';
import { TumauBaseResponse } from './TumauBaseResponse';
export declare type Body = Readable | string | null;
export interface ResponseConstuctorOptions {
    code?: HttpStatusCode;
    body?: Body;
    headers?: OutgoingHttpHeaders;
    originalResponse?: TumauResponse | null;
}
/**
 * Note: the correct name for this class is TumauRequestResponse
 * This is named TumauResponse because the vast majority of apps only handle the 'request' event
 */
export declare class TumauResponse extends TumauBaseResponse {
    readonly code: HttpStatusCode;
    readonly body: Body;
    readonly headers: OutgoingHttpHeaders;
    readonly originalResponse: TumauResponse | null;
    constructor(options?: ResponseConstuctorOptions);
    extends(overrides?: ResponseConstuctorOptions): ResponseConstuctorOptions;
    static withText(text: string): TumauResponse;
    static withHtml(html: string): TumauResponse;
    static noContent(): TumauResponse;
    static redirect(to: string, permanent?: boolean): TumauResponse;
    static withStream(stream: Readable, size: number): TumauResponse;
    static isTumauResponse(maybe: unknown): maybe is TumauResponse;
    static fromError(err: unknown, debug: boolean): TumauResponse;
}

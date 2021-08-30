/// <reference types="node" />
import { IncomingMessage, IncomingHttpHeaders } from 'http';
import { HttpMethod } from './HttpMethod';
export interface TumauRequestOptions {
    isUpgrade?: boolean;
}
export declare class TumauRequest {
    readonly req: IncomingMessage;
    readonly method: HttpMethod;
    readonly url: string;
    readonly headers: IncomingHttpHeaders;
    readonly origin: string | null;
    readonly isUpgrade: boolean;
    constructor(req: IncomingMessage, options?: TumauRequestOptions);
}

/// <reference types="node" />
import { TumauBaseResponse } from './TumauBaseResponse';
import { IncomingMessage, ServerResponse } from 'http';
export declare type RequestHander = (req: IncomingMessage, res: ServerResponse) => Promise<void> | void;
export declare class TumauHandlerResponse extends TumauBaseResponse {
    readonly handler: RequestHander;
    constructor(handler: RequestHander);
}

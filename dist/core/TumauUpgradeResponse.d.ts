/// <reference types="node" />
import { IncomingMessage } from 'http';
import { Duplex } from 'stream';
import { TumauBaseResponse } from './TumauBaseResponse';
export declare type UpgradeResponseHandler = (req: IncomingMessage, socket: Duplex, head: Buffer) => Promise<void>;
export declare class TumauUpgradeResponse extends TumauBaseResponse {
    readonly handler: UpgradeResponseHandler;
    constructor(handler: UpgradeResponseHandler);
    static fromError(err: unknown): TumauUpgradeResponse;
}

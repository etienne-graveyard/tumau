/// <reference types="node" />
import { IncomingMessage } from 'http';
export declare function requestToString(stream: IncomingMessage, limit: number): Promise<string>;

/// <reference types="node" />
import { IncomingMessage } from 'http';
export declare function parseStringBody(req: IncomingMessage, limit: number, expectedLength: number | null): Promise<string>;

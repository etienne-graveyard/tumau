/// <reference types="node" />
import { Writable, Readable } from 'stream';
export declare function notNill<T>(maybe: T | undefined | null): T;
export declare function isStream(maybe: unknown): maybe is Writable | Readable;
export declare function isWritableStream(maybe: unknown): maybe is Writable;

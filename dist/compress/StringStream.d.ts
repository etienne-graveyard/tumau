/// <reference types="node" />
import { Readable } from 'stream';
export declare class StringStream extends Readable {
    private str;
    private ended;
    constructor(str: string);
    _read(): void;
}

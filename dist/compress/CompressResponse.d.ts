/// <reference types="node" />
import { TumauResponse, Body } from '../core';
import { Readable } from 'stream';
import { ContentEncoding } from './ContentEnconding';
export declare class CompressResponse extends TumauResponse {
    originalResponse: TumauResponse;
    constructor(originalResponse: TumauResponse, encodings: Array<ContentEncoding>);
    static encodeBodyWithEncodings(body: Body, encodings: Array<ContentEncoding>): Readable | null;
    static encodeBodyWithEncoding(body: Readable, encoding: ContentEncoding): Readable;
    static fromResponse(originalResponse: TumauResponse, encodings: Array<ContentEncoding>): TumauResponse | CompressResponse;
}

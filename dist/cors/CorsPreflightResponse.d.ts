import { TumauResponse } from '../core';
import { CorsPreflightConfigResolved } from './utils';
export declare class CorsPreflightResponse extends TumauResponse {
    cors: CorsPreflightConfigResolved;
    constructor(config: CorsPreflightConfigResolved);
}

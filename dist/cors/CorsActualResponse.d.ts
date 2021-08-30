import { TumauResponse } from '../core';
interface CorsConfigResolved {
    allowOrigin: string;
    allowCredentials: boolean;
    exposeHeaders: Array<string> | null;
}
export declare class CorsActualResponse extends TumauResponse {
    originalResponse: TumauResponse;
    cors: CorsConfigResolved;
    constructor(originalResponse: TumauResponse, cors: CorsConfigResolved);
    static fromResponse(originalResponse: TumauResponse | null, cors: CorsConfigResolved): CorsActualResponse | TumauResponse | null;
}
export {};

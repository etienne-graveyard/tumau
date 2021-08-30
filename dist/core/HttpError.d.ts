import { HttpStatusCode, HttpStatusMessage } from './HttpStatus';
export declare class HttpError extends Error {
    message: HttpStatusMessage;
    code: HttpStatusCode;
    constructor(code: HttpStatusCode, message?: string);
    static LengthRequired: typeof LengthRequired;
    static NotAcceptable: typeof NotAcceptable;
    static PayloadTooLarge: typeof PayloadTooLarge;
    static BadRequest: typeof BadRequest;
    static NotFound: typeof NotFound;
    static ServerDidNotRespond: typeof ServerDidNotRespond;
    static Internal: typeof Internal;
    static Forbidden: typeof Forbidden;
    static Unauthorized: typeof Unauthorized;
    static TooManyRequests: typeof TooManyRequests;
}
declare class LengthRequired extends HttpError {
    constructor();
}
declare class NotAcceptable extends HttpError {
    info: string;
    constructor(info: string);
}
declare class PayloadTooLarge extends HttpError {
    constructor();
}
declare class NotFound extends HttpError {
    constructor();
}
declare class BadRequest extends HttpError {
    info: string | null;
    constructor(info?: string);
}
declare class ServerDidNotRespond extends HttpError {
    constructor();
}
declare class Unauthorized extends HttpError {
    constructor(reason?: string);
}
declare class Forbidden extends HttpError {
    constructor(reason?: string);
}
declare class TooManyRequests extends HttpError {
    constructor(reason?: string);
}
declare class Internal extends HttpError {
    internalStack?: string | undefined;
    constructor(message?: string, internalStack?: string | undefined);
    static fromError(error: any): Internal;
}
export {};

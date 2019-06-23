import { HttpStatusCode, HttpStatusMessage } from './HttpStatus';
declare class HttpError extends Error {
    message: HttpStatusMessage;
    code: HttpStatusCode;
    constructor(code: HttpStatusCode, message?: string);
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
    info: string;
    constructor(info: string);
}
export declare const HttpErrors: {
    HttpError: typeof HttpError;
    LengthRequired: typeof LengthRequired;
    NotAcceptable: typeof NotAcceptable;
    PayloadTooLarge: typeof PayloadTooLarge;
    BadRequest: typeof BadRequest;
    NotFound: typeof NotFound;
};
export {};

import { HttpStatus } from './HttpStatus';
class HttpError extends Error {
    constructor(code, message) {
        super(`HttpError`);
        this.code = code;
        this.message = message || HttpStatus.getMessage(code);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
class LengthRequired extends HttpError {
    constructor() {
        super(411);
    }
}
class NotAcceptable extends HttpError {
    constructor(info) {
        super(406, `${HttpStatus.getMessage(406)}: ${info}`);
        this.info = info;
    }
}
class PayloadTooLarge extends HttpError {
    constructor() {
        super(413);
    }
}
class NotFound extends HttpError {
    constructor() {
        super(404);
    }
}
class BadRequest extends HttpError {
    constructor(info) {
        super(400, `${HttpStatus.getMessage(400)}: ${info}`);
        this.info = info;
    }
}
export const HttpErrors = {
    HttpError,
    LengthRequired,
    NotAcceptable,
    PayloadTooLarge,
    BadRequest,
    NotFound,
};

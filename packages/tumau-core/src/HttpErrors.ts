import { HttpStatusCode, HttpStatusMessage, HttpStatus } from './HttpStatus';

class HttpError extends Error {
  public message: HttpStatusMessage;
  public code: HttpStatusCode;

  public constructor(code: HttpStatusCode, message?: string) {
    super(`HttpError`);
    this.code = code;
    this.message = message || HttpStatus.getMessage(code);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class LengthRequired extends HttpError {
  public constructor() {
    super(411);
  }
}

class NotAcceptable extends HttpError {
  public info: string;
  public constructor(info: string) {
    super(406, `${HttpStatus.getMessage(406)}: ${info}`);
    this.info = info;
  }
}

class PayloadTooLarge extends HttpError {
  public constructor() {
    super(413);
  }
}

class NotFound extends HttpError {
  public constructor() {
    super(404);
  }
}

class BadRequest extends HttpError {
  public info: string;
  public constructor(info: string) {
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

import { HttpStatusCode, HttpStatusMessage, HttpStatus } from './HttpStatus';

export class HttpError extends Error {
  public message: HttpStatusMessage;
  public code: HttpStatusCode;

  public constructor(code: HttpStatusCode, message?: string) {
    super(`HttpError`);
    if (HttpStatus.isError(code) === false) {
      console.error(
        [
          `You passed a non error HTTP code to HttpError (${code}). Tumau will use a 500 code instead.`,
          `If you want to interupt the flow with a non-error response you can \`throw new Response()\``,
        ].join('\n')
      );
      this.code = 500;
    } else {
      this.code = code;
    }
    this.message = message || HttpStatus.getMessage(code);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public static LengthRequired: typeof LengthRequired;
  public static NotAcceptable: typeof NotAcceptable;
  public static PayloadTooLarge: typeof PayloadTooLarge;
  public static BadRequest: typeof BadRequest;
  public static NotFound: typeof NotFound;
  public static ServerDidNotRespond: typeof ServerDidNotRespond;
  public static Internal: typeof Internal;
  public static Forbidden: typeof Forbidden;
  public static Unauthorized: typeof Unauthorized;
}

class LengthRequired extends HttpError {
  public constructor() {
    super(411);
  }
}

class NotAcceptable extends HttpError {
  public info: string;
  public constructor(info: string) {
    super(406, HttpStatus.getMessage(406, info));
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
  public info: string | null = null;
  public constructor(info?: string) {
    super(400, HttpStatus.getMessage(400, info));
    this.info = info || null;
  }
}

class ServerDidNotRespond extends HttpError {
  public constructor() {
    super(500, HttpStatus.getMessage(500, 'Server did not respond'));
  }
}

class Unauthorized extends HttpError {
  public constructor(reason?: string) {
    super(401, HttpStatus.getMessage(401, reason));
  }
}

class Forbidden extends HttpError {
  public constructor(reason?: string) {
    super(403, `${HttpStatus.getMessage(403, reason)}`);
  }
}

class Internal extends HttpError {
  public constructor(message: string = '') {
    super(500, `${HttpStatus.getMessage(500)}: ${message}`);
  }
}

HttpError.LengthRequired = LengthRequired;
HttpError.NotAcceptable = NotAcceptable;
HttpError.PayloadTooLarge = PayloadTooLarge;
HttpError.BadRequest = BadRequest;
HttpError.NotFound = NotFound;
HttpError.ServerDidNotRespond = ServerDidNotRespond;
HttpError.Internal = Internal;
HttpError.Forbidden = Forbidden;
HttpError.Unauthorized = Unauthorized;

import { Middleware } from './Middleware';
import { HttpErrorToTextResponse } from './HttpErrorToTextResponse';
import { ErrorToHttpError } from './ErrorToHttpError';
import { InvalidResponseToHttpError } from './InvalidResponseToHttpError';

/**
 * Ensure the server will response in case of error
 */
export const ErrorHandlerPackage = Middleware.compose(
  HttpErrorToTextResponse,
  ErrorToHttpError,
  InvalidResponseToHttpError
);

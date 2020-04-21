import { Middleware } from './Middleware';
import { HttpError } from './HttpError';

/**
 * Handle any error and convert it to an HttpError if it's not one
 */
export const ErrorToHttpError: Middleware = async (tools) => {
  try {
    return await tools.next();
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.Internal.fromError(error);
  }
};

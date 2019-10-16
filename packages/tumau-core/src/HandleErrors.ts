import { Middleware } from './Middleware';
import { TumauResponse } from './TumauResponse';

export const HandleErrors: Middleware = async (ctx, next) => {
  try {
    return await next(ctx);
  } catch (error) {
    console.error(error);
    return TumauResponse.fromError(error);
  }
};

import { Middleware } from './Middleware';
import { Response } from './Response';

export const HandleErrors: Middleware = async (ctx, next) => {
  try {
    return await next(ctx);
  } catch (error) {
    console.error(error);
    return Response.fromError(error);
  }
};

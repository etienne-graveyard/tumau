import { Middleware } from './Middleware';
import { BaseContext } from './BaseContext';
import { Response } from './Response';

export const HandleErrors = <Ctx extends BaseContext>(): Middleware<Ctx> => {
  return async (ctx, next) => {
    try {
      return await next(ctx);
    } catch (error) {
      return Response.fromError(error);
    }
  };
};

import { Middleware } from './Middleware';
import { TumauResponse } from './TumauResponse';

export const HandleErrors: Middleware = async tools => {
  try {
    return await tools.next();
  } catch (error) {
    // console.error(error);
    return TumauResponse.fromError(error);
  }
};

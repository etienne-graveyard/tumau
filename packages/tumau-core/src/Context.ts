import { Request } from './Request';
import { Response } from './Response';

export interface Context<Req extends Request = Request, Res extends Response = Response> {
  request: Req;
  response: Res;
}

export const Context = {
  create: createContext,
};

async function createContext<Req extends Request = Request, Res extends Response = Response>(
  request: Req,
  response: Res
): Promise<Context<Req, Res>> {
  const context: Context<Req, Res> = {
    request,
    response,
  };

  return context;
}

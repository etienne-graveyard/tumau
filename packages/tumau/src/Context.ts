import { Request } from './Request';
import { Response } from './Response';

export interface Context<Req extends Request = Request, Res extends Response = Response> {
  request: Req;
  response: Res;
}

export const Context = {
  create: createContext,
};

function createContext<Req extends Request = Request, Res extends Response = Response>(
  request: Req,
  response: Res
): Context<Req, Res> {
  const context: Context<Req, Res> = {
    request,
    response,
  };

  return context;
}

import { Request } from './Request';
import http from 'http';

export interface BaseContext {
  request: Request;
  res: http.ServerResponse;
}

export const BaseContext = {
  create: createBaseContext,
};

function createBaseContext(request: Request, res: http.ServerResponse): BaseContext {
  return { request, res };
}

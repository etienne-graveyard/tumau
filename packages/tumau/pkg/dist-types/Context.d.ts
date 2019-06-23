import { Request } from './Request';
import { Response } from './Response';
export interface Context<Req extends Request = Request, Res extends Response = Response> {
    request: Req;
    response: Res;
}
export declare const Context: {
    create: typeof createContext;
};
declare function createContext<Req extends Request = Request, Res extends Response = Response>(request: Req, response: Res): Promise<Context<Req, Res>>;
export {};

import { Context } from './Context';
export declare type Next = () => Promise<void>;
export declare type Middleware<Ctx extends Context = Context> = (ctx: Ctx, next: Next) => Promise<any> | void;
export declare type Middlewares<Ctx extends Context = Context> = Array<Middleware<Ctx>>;
export declare const Middleware: {
    compose: typeof compose;
};
declare function compose<Ctx extends Context = Context>(...middlewares: Middlewares<Ctx>): Middleware<Ctx>;
export {};

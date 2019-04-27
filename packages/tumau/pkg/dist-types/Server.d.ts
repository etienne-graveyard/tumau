/// <reference types="node" />
import http from 'http';
import { Middleware } from './Middleware';
import { Context } from './Context';
export interface Server {
    httpServer: http.Server;
    listen(port: number, listeningListener?: () => void): Server;
}
interface Options {
    httpServer?: http.Server;
    onError?: (err: any, ctx: Context) => void;
}
export declare const Server: {
    create: typeof createServer;
};
declare function createServer(mainMiddleware: Middleware, options?: Options): Server;
export {};

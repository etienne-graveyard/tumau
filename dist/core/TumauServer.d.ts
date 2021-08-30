/// <reference types="node" />
import { Server, ServerResponse, IncomingMessage } from 'http';
import { Duplex } from 'stream';
import { Middleware } from './Middleware';
export interface TumauHandlers {
    requestHandler(req: IncomingMessage, res: ServerResponse): Promise<void>;
    upgradeHandler(req: IncomingMessage, socket: Duplex, head: Buffer): Promise<void>;
}
export interface TumauServer extends TumauHandlers {
    httpServer: Server;
    listen(port?: number, listeningListener?: () => void): TumauServer;
}
export interface HandlerOptions {
    mainMiddleware: Middleware;
    debug?: boolean;
}
export interface ServerOptions extends HandlerOptions {
    httpServer?: Server;
    handleServerRequest?: boolean;
    handleServerUpgrade?: boolean;
}
export declare function createHandlers(opts: Middleware | HandlerOptions): TumauHandlers;
export declare function createServer(opts: Middleware | ServerOptions): TumauServer;

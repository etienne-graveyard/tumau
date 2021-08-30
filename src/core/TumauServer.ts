import { Server, createServer as createHttpServer, OutgoingHttpHeaders, ServerResponse, IncomingMessage } from 'http';
import { Duplex } from 'stream';
import { Middleware } from './Middleware';
import { TumauRequest } from './TumauRequest';
import { TumauResponse } from './TumauResponse';
import { HttpStatus } from './HttpStatus';
import { HttpMethod } from './HttpMethod';
import { HttpHeaders } from './HttpHeaders';
import { isWritableStream } from './utils';
import { HttpError } from './HttpError';
import {
  RequestContext,
  ServerResponseContext,
  UpgradeSocketContext,
  UpgradeHeadContext,
  DebugContext,
} from './Contexts';
import { TumauUpgradeResponse } from './TumauUpgradeResponse';
import { ContextStack } from 'miid';
import { TumauHandlerResponse } from './TumauHandlerResponse';

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
  // In debug mode error stack are returned
  // the default value is false
  debug?: boolean;
}

export interface ServerOptions extends HandlerOptions {
  httpServer?: Server;
  // The server should handle the 'request' event (default true)
  handleServerRequest?: boolean;
  // The server should handle the 'upgrade' event (default false)
  // this is used for websocket
  handleServerUpgrade?: boolean;
}

export function createHandlers(opts: Middleware | HandlerOptions): TumauHandlers {
  const options = typeof opts === 'function' ? { mainMiddleware: opts } : opts;
  const { mainMiddleware, debug = false } = options;

  const handlers: TumauHandlers = {
    requestHandler,
    upgradeHandler,
  };

  return handlers;

  async function requestHandler(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const request = new TumauRequest(req);

    const requestCtx = RequestContext.Provider(request);
    const resCtx = ServerResponseContext.Provider(res);
    const debugCtx = DebugContext.Provider(debug);

    return Promise.resolve(mainMiddleware(ContextStack.createFrom(requestCtx, resCtx, debugCtx), () => null))
      .then((response) => {
        return sendResponseAny(response, res, request);
      })
      .catch((err): void => {
        // fatal
        const IS_TEST = process.env.JEST_WORKER_ID !== undefined;
        if (!IS_TEST) {
          console.error(err);
        }
        if (!res.writableEnded) {
          res.end();
        }
      });
  }

  async function upgradeHandler(req: IncomingMessage, socket: Duplex, head: Buffer): Promise<void> {
    const request = new TumauRequest(req, { isUpgrade: true });

    const requestCtx = RequestContext.Provider(request);
    const socketCtx = UpgradeSocketContext.Provider(socket);
    const headCtx = UpgradeHeadContext.Provider(head);
    const debugCtx = DebugContext.Provider(debug);

    return Promise.resolve(
      mainMiddleware(ContextStack.createFrom(requestCtx, socketCtx, headCtx, debugCtx), () => null)
    )
      .then((response) => {
        // On upgrade if no response we just destroy the socket.
        if (response === null) {
          socket.destroy();
          return;
        }
        if (response instanceof TumauUpgradeResponse) {
          // valid response
          return response.handler(req, socket, head);
        }
        if (response instanceof TumauResponse) {
          throw new Error(
            `Tumau received a TumauResponse on an 'upgrade' event. You should return null or a 'TumauUpgradeResponse'`
          );
        }
        if (response instanceof TumauHandlerResponse) {
          throw new Error(
            `Tumau received a TumauHandlerResponse on an 'upgrade' event. You should return null or a 'TumauUpgradeResponse'`
          );
        }
        if (response instanceof Error || response instanceof HttpError) {
          // we can't send response so Error or HttpError are fatal
          throw response;
        }
        throw new Error(`Invalid response`);
      })
      .catch((err): void => {
        // fatal
        console.error(err);
        socket.destroy();
      });
  }

  async function sendResponseAny(response: any, res: ServerResponse, request: TumauRequest): Promise<void> {
    if (response instanceof TumauHandlerResponse) {
      await response.handler(request.req, res);
      return;
    }
    if (res.writableEnded) {
      throw new Error('Response finished ?');
    }
    if (res.headersSent) {
      throw new Error('Header already sent !');
    }
    if (response === null) {
      throw new Error('Response is null');
    }
    if (response instanceof TumauResponse === false) {
      throw new Error('The returned response is not valid (does not inherit the TumauResponse class)');
    }
    return sendResponse(response, res, request);
  }

  function sendResponse(response: TumauResponse, res: ServerResponse, request: TumauRequest): void {
    const headers: OutgoingHttpHeaders = {
      ...response.headers,
    };

    const isEmpty =
      HttpStatus.isEmpty(response.code) || request.method === HttpMethod.HEAD || request.method === HttpMethod.OPTIONS;

    if (isEmpty) {
      // remove content related header
      if (headers[HttpHeaders.ContentType]) {
        delete headers[HttpHeaders.ContentType];
      }
      if (headers[HttpHeaders.ContentLength]) {
        delete headers[HttpHeaders.ContentLength];
      }
      if (headers[HttpHeaders.ContentEncoding]) {
        delete headers[HttpHeaders.ContentEncoding];
      }
    }

    const body = response.body;

    let code = response.code;
    if (code === 200 && isEmpty) {
      code = 204;
    }

    res.writeHead(code, headers);

    if (isEmpty) {
      return res.end();
    }
    // send body
    if (body === null || body === undefined) {
      return res.end();
    }
    if (typeof body === 'string') {
      return res.end(body);
    }
    if (isWritableStream(body)) {
      body.pipe(res);
      return;
    }
    throw new Error(`Invalid body`);
  }
}

export function createServer(opts: Middleware | ServerOptions): TumauServer {
  const options = typeof opts === 'function' ? { mainMiddleware: opts } : opts;
  const { httpServer, handleServerRequest = true, handleServerUpgrade = false, ...handlerOptions } = options;

  const { requestHandler, upgradeHandler } = createHandlers(handlerOptions);

  const resolvedHttpServer: Server = httpServer || createHttpServer();

  const server: TumauServer = {
    httpServer: resolvedHttpServer,
    requestHandler,
    upgradeHandler,
    listen,
  };

  return server;

  function listen(port?: number, listeningListener?: () => void): TumauServer {
    if (handleServerRequest) {
      resolvedHttpServer.on('request', requestHandler);
    }
    if (handleServerUpgrade) {
      resolvedHttpServer.on('upgrade', upgradeHandler);
    }
    resolvedHttpServer.listen(port, listeningListener);
    return server;
  }
}

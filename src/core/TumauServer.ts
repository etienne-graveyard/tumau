import { Server, createServer as createHttpServer, OutgoingHttpHeaders, ServerResponse, IncomingMessage } from 'http';
import { Duplex } from 'stream';
import { Middleware } from './Middleware';
import { TumauContext } from './TumauContext';
import { TumauRequestResponse } from './TumauRequestResponse';
import { HttpStatus } from './HttpStatus';
import { HttpMethod } from './HttpMethod';
import { HttpResponseHeader, HttpResponseHeaders } from './HttpHeaders';
import { isWritableStream } from './utils';
import { HttpError } from './HttpError';
import { TumauUpgradeResponse } from './TumauUpgradeResponse';
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
    const ctx = TumauContext.create(req, { isUpgrade: false, res, debug });

    return Promise.resolve(mainMiddleware(ctx, async () => null))
      .then((response) => {
        return sendResponseAny(req, res, response, ctx);
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
    const ctx = TumauContext.create(req, { isUpgrade: true, socket, debug, head });

    return Promise.resolve(mainMiddleware(ctx, async () => null))
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
        if (response instanceof TumauRequestResponse) {
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

  async function sendResponseAny(
    req: IncomingMessage,
    res: ServerResponse,
    response: unknown,
    ctx: TumauContext
  ): Promise<void> {
    if (response instanceof TumauHandlerResponse) {
      await response.handler(req, res);
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
    if (response instanceof TumauRequestResponse) {
      return sendRequestResponse(res, ctx, response);
    }
    throw new Error('The returned response is not valid (does not inherit the TumauRequestResponse class)');
  }

  function sendRequestResponse(res: ServerResponse, ctx: TumauContext, response: TumauRequestResponse): void {
    const headers = headersFromResponseHeaders(response.headers);

    const isEmpty =
      HttpStatus.isEmpty(response.status) || ctx.method === HttpMethod.HEAD || ctx.method === HttpMethod.OPTIONS;

    if (isEmpty) {
      // remove content related header
      if (headers[HttpResponseHeader.ContentType]) {
        delete headers[HttpResponseHeader.ContentType];
      }
      if (headers[HttpResponseHeader.ContentLength]) {
        delete headers[HttpResponseHeader.ContentLength];
      }
      if (headers[HttpResponseHeader.ContentEncoding]) {
        delete headers[HttpResponseHeader.ContentEncoding];
      }
    }

    const body = response.body;

    let code = response.status;
    if (code === 200 && isEmpty) {
      code = 204;
    }

    res.writeHead(code, headers);

    if (isEmpty) {
      res.end();
      return;
    }
    // send body
    if (body === null || body === undefined) {
      res.end();
      return;
    }
    if (typeof body === 'string') {
      res.end(body);
      return;
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

function headersFromResponseHeaders(headers: HttpResponseHeaders): OutgoingHttpHeaders {
  const result: OutgoingHttpHeaders = {};
  for (const [key, value] of headers) {
    const current = result[key];
    if (current) {
      if (Array.isArray(current)) {
        current.push(value as any);
      } else {
        result[key] = [current as any, value];
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

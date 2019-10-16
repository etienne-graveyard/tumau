import http, { OutgoingHttpHeaders } from 'http';
import { Middleware } from './Middleware';
import { TumauRequest } from './TumauRequest';
import { TumauResponse } from './TumauResponse';
import { HttpStatus } from './HttpStatus';
import { HttpMethod } from './HttpMethod';
import { HttpHeaders } from './HttpHeaders';
import { isWritableStream } from './utils';
import { HandleErrors } from './HandleErrors';
import { HandleInvalidResponse } from './HandleInvalidResponse';
import { Context, ContextStack, ContextManager } from './Context';

// We force a deault value because these context are always there !
export const RequestContext = Context.create<TumauRequest>('TumauRequest', null as any);
export const RequestConsumer = RequestContext.Consumer;

export const ServerResponseContext = Context.create<http.ServerResponse>('ServerResponse', null as any);
export const ServerResponseConsumer = ServerResponseContext.Consumer;

export interface Server {
  httpServer: http.Server;
  listen(port: number, listeningListener?: () => void): Server;
}

interface Options {
  mainMiddleware: Middleware;
  handleErrors?: boolean;
  httpServer?: http.Server;
}

export const Server = {
  create: createServer,
};

function createServer(opts: Middleware | Options): Server {
  const options = typeof opts === 'function' ? { mainMiddleware: opts } : opts;
  const { mainMiddleware, handleErrors = true } = options;

  const httpServer: http.Server = options.httpServer || http.createServer();

  const server: Server = {
    httpServer,
    listen,
  };

  return server;

  function listen(port: number, listeningListener?: () => void): Server {
    httpServer.on('request', handler);
    httpServer.listen(port, listeningListener);
    return server;
  }

  async function handler(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const request = new TumauRequest(req);

    const requestCtx = RequestContext.Provider(request);
    const resCtx = ServerResponseContext.Provider(res);

    const wrappedMiddleware: Middleware = handleErrors
      ? Middleware.compose(
          HandleErrors,
          HandleInvalidResponse,
          mainMiddleware
        )
      : mainMiddleware;

    const rootStack = ContextStack.create(resCtx, requestCtx);
    const rootContext = ContextManager.create(rootStack);

    return Promise.resolve(wrappedMiddleware(rootContext, () => Promise.resolve(null)))
      .then(response => {
        sendResponseAny(response, res, request);
      })
      .catch((err): void => {
        // fatal
        console.error(err);
        if (!res.finished) {
          res.end();
        }
      });
  }

  function sendResponseAny(response: any, res: http.ServerResponse, request: TumauRequest): void {
    if (res.finished) {
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

  function sendResponse(response: TumauResponse, res: http.ServerResponse, request: TumauRequest): void {
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

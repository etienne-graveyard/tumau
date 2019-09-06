import http, { OutgoingHttpHeaders } from 'http';
import { Middleware } from './Middleware';
import { Request } from './Request';
import { Response } from './Response';
import { BaseContext } from './BaseContext';
import { HttpStatus } from './HttpStatus';
import { HttpMethod } from './HttpMethod';
import { HttpHeaders } from './HttpHeaders';
import { isWritableStream } from './utils';
import { HandleErrors } from './HandleErrors';
import { HandleInvalidResponse } from './HandleInvalidResponse';

export interface Server {
  httpServer: http.Server;
  listen(port: number, listeningListener?: () => void): Server;
}

interface Options<Ctx extends BaseContext> {
  mainMiddleware: Middleware<Ctx>;
  handleErrors?: boolean;
  createInitialCtx?: (ctx: BaseContext) => Ctx;
  httpServer?: http.Server;
}

export const Server = {
  create: createServer,
};

function createServer<Ctx extends BaseContext>(opts: Middleware<Ctx> | Options<Ctx>): Server {
  const options = typeof opts === 'function' ? { mainMiddleware: opts } : opts;
  const { mainMiddleware, createInitialCtx = ((ctx: BaseContext) => ctx) as any, handleErrors = true } = options;

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
    const request = await Request.create(req);
    const baseCtx = await BaseContext.create(request, res);
    const ctx = createInitialCtx(baseCtx);

    const wrappedMiddleware: Middleware<Ctx> = handleErrors
      ? Middleware.compose<Ctx>(
          HandleErrors(),
          HandleInvalidResponse(),
          mainMiddleware
        )
      : mainMiddleware;

    return Promise.resolve(wrappedMiddleware(ctx, async () => Middleware.resolveResult(ctx, null)))
      .then(res => Middleware.resolveResult(ctx, res))
      .then(result => {
        sendResponseAny(result.response, res, request);
      })
      .catch((err): void => {
        // fatal
        console.error(err);
        if (!res.finished) {
          res.end();
        }
      });
  }

  function sendResponseAny(response: any, res: http.ServerResponse, request: Request): void {
    if (res.finished) {
      throw new Error('Response finished ?');
    }
    if (res.headersSent) {
      throw new Error('Header already sent !');
    }
    if (response === null) {
      throw new Error('Response is null');
    }
    if (response instanceof Response === false) {
      throw new Error('The returned response is not valid (does not inherit the Response class)');
    }

    return sendResponse(response, res, request);
  }

  function sendResponse(response: Response, res: http.ServerResponse, request: Request): void {
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

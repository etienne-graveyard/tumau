import http, { OutgoingHttpHeaders } from 'http';
import { Middleware } from './Middleware';
import { Request } from './Request';
import { Response } from './Response';
import { BaseContext } from './BaseContext';
import { HttpStatus } from './HttpStatus';
import { HttpMethod } from './HttpMethod';
import { HttpError } from './HttpError';
import { HttpHeaders } from './HttpHeaders';

export interface Server {
  httpServer: http.Server;
  listen(port: number, listeningListener?: () => void): Server;
}

interface Options<Ctx extends BaseContext> {
  mainMiddleware: Middleware<Ctx>;
  createInitialCtx?: (ctx: BaseContext) => Ctx;
  httpServer?: http.Server;
}

export const Server = {
  create: createServer,
};

function createServer<Ctx extends BaseContext>(opts: Middleware<Ctx> | Options<Ctx>): Server {
  const options = typeof opts === 'function' ? { mainMiddleware: opts } : opts;
  const { mainMiddleware, createInitialCtx = (ctx: BaseContext) => ctx as any } = options;

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

    const wrappedMiddleware: Middleware<Ctx> = async (ctx, next) => {
      return mainMiddleware(ctx, next);
    };

    return Promise.resolve(wrappedMiddleware(ctx, async () => Middleware.resolveResult(ctx, null)))
      .then(res => Middleware.resolveResult(ctx, res))
      .then(({ response }): void => {
        if (response === null) {
          throw new HttpError.ServerDidNotRespond();
        }
        if (response instanceof Response === false) {
          throw new HttpError.Internal(`The returned response is not valid (does not inherit the Response class)`);
        }
        sendResponse(response, res, request);
      })
      .catch((err): void => {
        // we allow to throw new Response()
        if (err instanceof Response) {
          return sendResponse(err, res, request);
        }
        if (err instanceof Error) {
          return sendResponse(Response.fromError(err), res, request);
        }
        return sendResponse(Response.fromError(new HttpError(500)), res, request);
      })
      .catch((err): void => {
        // fatal
        console.error(err);
        res.end();
      });
  }

  function sendResponse(response: Response, res: http.ServerResponse, request: Request): void {
    if (res.finished) {
      throw new Error('Response finished ?');
    }
    if (res.headersSent) {
      throw new Error('Header already sent !');
    }
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

    const bodyStr = response.body;

    let code = response.code;
    if (code === 200 && isEmpty) {
      code = 204;
    }

    res.writeHead(code, headers);

    if (isEmpty) {
      return res.end();
    }
    return res.end(bodyStr);
  }
}

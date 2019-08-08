import http, { OutgoingHttpHeaders } from 'http';
import { Middleware, Result } from './Middleware';
import { Request } from './Request';
import { Response } from './Response';
import { BaseContext } from './BaseContext';
import { HttpStatus } from './HttpStatus';
import { HttpMethod } from './HttpMethod';

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

    return Promise.resolve(
      mainMiddleware(
        ctx,
        async (ctx): Promise<Result<Ctx>> => {
          return { ctx, response: null };
        }
      )
    )
      .then(({ response, ctx }): void => {
        if (response === null) {
          throw new Error('Server did not respond !');
        }
        sendResponse(response, ctx);
      })
      .catch((err): void => {
        // fatal
        console.error(err);
        res.end();
      });
  }

  function sendResponse(response: Response, ctx: Ctx): void {
    if (ctx.res.finished) {
      throw new Error('Response finished ?');
    }
    if (ctx.res.headersSent) {
      throw new Error('Header already sent !');
    }
    const headers: OutgoingHttpHeaders = {
      ...response.headers,
    };

    const isEmpty =
      HttpStatus.isEmpty(response.code) ||
      ctx.request.method === HttpMethod.HEAD ||
      ctx.request.method === HttpMethod.OPTIONS;

    const bodyStr = response.body;

    let code = response.code;
    if (code === 200 && isEmpty) {
      code = 204;
    }

    ctx.res.writeHead(code, headers);

    if (isEmpty) {
      return ctx.res.end();
    }
    return ctx.res.end(bodyStr);
  }
}

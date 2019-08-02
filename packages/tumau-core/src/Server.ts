import http from 'http';
import { Middleware } from './Middleware';
import { Request } from './Request';
import { Response } from './Response';
import { Context } from './Context';
import { BodyParser } from './BodyParser';
import { HttpErrors } from './HttpErrors';
import { HttpStatus } from './HttpStatus';

export interface Server {
  httpServer: http.Server;
  listen(port: number, listeningListener?: () => void): Server;
}

interface Options {
  httpServer?: http.Server;
  onError?: (err: {}, ctx: Context) => void;
}

export const Server = {
  create: createServer,
};

function createServer(mainMiddleware: Middleware, options: Options = {}): Server {
  const onError = options.onError || defaultOnError;
  const httpServer: http.Server = options.httpServer || http.createServer();

  const rootMiddleware = Middleware.compose(
    BodyParser.create(),
    mainMiddleware
  );

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

  function defaultOnError(error: {}, ctx: Context): void {
    if (error instanceof HttpErrors.HttpError) {
      ctx.response.create(
        {
          code: error.code,
          json: {
            code: error.code,
            message: error.message,
          },
        },
        { force: true }
      );
      return;
    }
    const message = error instanceof Error ? error.message : HttpStatus.getMessage(500);
    ctx.response.create(
      {
        code: 500,
        json: {
          code: 500,
          message,
        },
      },
      { force: true }
    );
    return;
  }

  async function handler(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const request = await Request.create(req);
    const response = await Response.create(res);
    const ctx = await Context.create(request, response);

    return Promise.resolve(
      rootMiddleware(
        ctx,
        async (): Promise<void> => {
          return defaultOnError({ code: 500, message: 'Server did not respond' }, ctx);
        }
      )
    )
      .catch((err): void => {
        return onError(err, ctx);
      })
      .then((): void => {
        if (response.sent === false) {
          defaultOnError({ code: 500, message: 'Server did not respond' }, ctx);
        }
        response.__send(ctx);
      })
      .catch((err): void => {
        // fatal
        console.error(err);
        ctx.response.res.end();
      });
  }
}

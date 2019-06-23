import http from 'http';
import { Middleware } from './Middleware';
import { Request } from './Request';
import { Response } from './Response';
import { Context } from './Context';
import { BodyParser } from './BodyParser';

export interface Server {
  httpServer: http.Server;
  listen(port: number, listeningListener?: () => void): Server;
}

interface Options {
  httpServer?: http.Server;
  onError?: (err: any, ctx: Context) => void;
}

export const Server = {
  create: createServer,
};

function createServer(mainMiddleware: Middleware, options: Options = {}): Server {
  const onError = options.onError || defaultOnError;
  const httpServer: http.Server = options.httpServer || http.createServer();
  // const router = Router.create();
  // const apps = {};
  // const globalMiddlewares: Middlewares = [];
  // const onNoMatch: Middleware = options.onNoMatch || defaultOnNoMatch;

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

  // function use(...fns: Middlewares): Server {
  //   globalMiddlewares.push(...fns);
  //   return server; // chainable
  // }

  function defaultOnError(err: any, ctx: Context): void {
    const code = err.code || err.status || 500;

    const message = (err.length && err) || err.message || http.STATUS_CODES[code];
    return ctx.response.send({
      code,
      json: {
        message,
      },
    });
  }

  async function handler(req: http.IncomingMessage, res: http.ServerResponse) {
    const request = await Request.create(req);
    const response = await Response.create(res);
    const ctx = await Context.create(request, response);

    return Promise.resolve(
      mainMiddleware(ctx, async () => {
        return ctx.response.send({
          code: 500,
          json: {
            message: 'Server did not respond',
          },
        });
      })
    ).catch(err => {
      return onError(err, ctx);
    });
  }
}

// function mutate(str: string, req: http.IncomingMessage) {
//   req.url = req.url.substring(str.length) || '/';
//   req.path = req.path.substring(str.length) || '/';
// }

// function onError(err: Error, _req: TumauIncomingMessage, res: ServerResponse, _next: any) {
//   let code = (res.statusCode = err.code || err.status || 500);
//   res.end((err.length && err) || err.message || http.STATUS_CODES[code]);
// }

/*

class Polka extends Router {
  constructor(opts = {}) {
    super();
    this.apps = {};
    this.wares = [];
    this.bwares = {};
    this.parse = parser;
    this.server = opts.server;
    this.handler = this.handler.bind(this);
    this.onError = opts.onError || onError; // catch-all handler
    this.onNoMatch = opts.onNoMatch || this.onError.bind(null, { code: 404 });
  }

  add(method, pattern, ...fns) {
    let base = ensureLeadingSlash(value(pattern));
    if (this.apps[base] !== void 0)
      throw new Error(
        `Cannot mount ".${method.toLowerCase()}('${ensureLeadingSlash(
          pattern
        )}')" because a Polka application at ".use('${base}')" already exists! You should move this handler into your Polka application instead.`
      );
    return super.add(method, pattern, ...fns);
  }

  use(base, ...fns) {
    if (typeof base === 'function') {
      this.wares = this.wares.concat(base, fns);
    } else if (base === '/') {
      this.wares = this.wares.concat(fns);
    } else {
      base = ensureLeadingSlash(base);
      fns.forEach(fn => {
        if (fn instanceof Polka) {
          this.apps[base] = fn;
        } else {
          let arr = this.bwares[base] || [];
          arr.length > 0 || arr.push((r, _, nxt) => (mutate(base, r), nxt()));
          this.bwares[base] = arr.concat(fn);
        }
      });
    }
    return this; // chainable
  }

  listen() {
    (this.server = this.server || http.createServer()).on('request', this.handler);
    this.server.listen.apply(this.server, arguments);
    return this;
  }

  handler(req, res, info) {
    info = info || Router.parseRoute(req.url);
    let fns = [],
      arr = this.wares,
      obj = this.find(req.method, info.pathname);
    req.originalUrl = req.originalUrl || req.url;
    let base = value((req.path = info.pathname));
    if (this.bwares[base] !== void 0) {
      arr = arr.concat(this.bwares[base]);
    }
    if (obj) {
      fns = obj.handlers;
      req.params = obj.params;
    } else if (this.apps[base] !== void 0) {
      mutate(base, req);
      info.pathname = req.path; //=> updates
      fns.push(this.apps[base].handler.bind(null, req, res, info));
    } else if (fns.length === 0) {
      fns.push(this.onNoMatch);
    }
    // Grab addl values from `info`
    req.search = info.search;
    req.query = parse(info.query);
    // Exit if only a single function
    let i = 0,
      len = arr.length,
      num = fns.length;
    if (len === i && num === 1) return fns[0](req, res);
    // Otherwise loop thru all middlware
    let next = (err) => (err ? this.onError(err, req, res, next) : loop());
    let loop = () => res.finished || (i < len && arr[i++](req, res, next));
    arr = arr.concat(fns);
    len += num;
    loop(); // init
  }
}


*/

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var http = _interopDefault(require('http'));
var querystring = require('querystring');
var string_decoder = require('string_decoder');

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

const Middleware = {
  compose
};

function compose(...middlewares) {
  return (
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(function* (ctx, next) {
        // last called middleware #
        let index = -1;
        return dispatch(0);

        function dispatch(i) {
          if (i <= index) {
            return Promise.reject(new Error('next() called multiple times'));
          }

          index = i;
          let fn = middlewares[i];

          if (i === middlewares.length) {
            fn = next;
          }

          if (!fn) {
            return Promise.resolve();
          }

          try {
            return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)));
          } catch (err) {
            return Promise.reject(err);
          }
        }
      });

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }()
  );
}

const Request = {
  create: createRequest,
  parseUrl
};

function createRequest(_x) {
  return _createRequest.apply(this, arguments);
}

function _createRequest() {
  _createRequest = _asyncToGenerator(function* (req) {
    const url = req.url; // never null because IncomingMessage come from http.Server

    const parsed = parseUrl(url);
    const method = req.method; // const route = router.find(method, parsed.pathname);
    // const notFound = route.middlewares.length === 0;

    const request = {
      req,
      url,
      method,
      href: parsed.href,
      path: parsed.path,
      pathname: parsed.pathname,
      rawQuery: parsed.query,
      query: parsed.query ? querystring.parse(parsed.query) : null,
      search: parsed.search,
      body: {}
    };
    return request;
  });
  return _createRequest.apply(this, arguments);
}

function parseUrl(url) {
  const obj = {
    query: null,
    search: null,
    _raw: url,
    href: url,
    path: url,
    pathname: url
  };
  let idx = url.indexOf('?', 1);

  if (idx !== -1) {
    const search = url.substring(idx);
    obj.search = search;
    obj.query = search.substring(1);
    obj.pathname = url.substring(0, idx);
  }

  return obj;
} // =======================
// =======================
// =======================
// =======================
// =======================
// =======================
// =======================
// =======================
// =======================

const Response = {
  create: createResponse
};

function createResponse(_x) {
  return _createResponse.apply(this, arguments);
}

function _createResponse() {
  _createResponse = _asyncToGenerator(function* (res) {
    const response = {
      res,
      send
    };
    return response;

    function send(options = {}) {
      const _options$code = options.code,
            code = _options$code === void 0 ? 200 : _options$code,
            _options$headers = options.headers,
            headers = _options$headers === void 0 ? {} : _options$headers,
            _options$json = options.json,
            json = _options$json === void 0 ? {
        enpty: true
      } : _options$json;
      const obj = {};

      for (let k in headers) {
        obj[k.toLowerCase()] = headers[k];
      }

      const dataStr = JSON.stringify(json);
      obj['content-type'] = obj['content-type'] || res.getHeader('content-type') || 'application/json;charset=utf-8';
      obj['content-length'] = Buffer.byteLength(dataStr);
      res.writeHead(code, obj);
      res.end(dataStr);
    }
  });
  return _createResponse.apply(this, arguments);
}

const Context = {
  create: createContext
};

function createContext(_x, _x2) {
  return _createContext.apply(this, arguments);
}

function _createContext() {
  _createContext = _asyncToGenerator(function* (request, response) {
    const context = {
      request,
      response
    };
    return context;
  });
  return _createContext.apply(this, arguments);
}

(function (HTTPMethod) {
  HTTPMethod["ALL"] = "ALL";
  HTTPMethod["GET"] = "GET";
  HTTPMethod["HEAD"] = "HEAD";
  HTTPMethod["PATCH"] = "PATCH";
  HTTPMethod["OPTIONS"] = "OPTIONS";
  HTTPMethod["CONNECT"] = "CONNECT";
  HTTPMethod["DELETE"] = "DELETE";
  HTTPMethod["TRACE"] = "TRACE";
  HTTPMethod["POST"] = "POST";
  HTTPMethod["PUT"] = "PUT";
})(exports.HTTPMethod || (exports.HTTPMethod = {}));

const BodyParser = {
  create: createBodyParser
};

function createBodyParser() {
  return (
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(function* (ctx, next) {
        if (ctx.request.method === exports.HTTPMethod.GET || ctx.request.method === exports.HTTPMethod.DELETE) {
          return next();
        }

        const _1mb = 1024 * 1024 * 1024;

        const body = yield parseBody(ctx.request.req, {
          limit: _1mb
        });
        ctx.request.body = body;
        return next();
      });

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }()
  );
} // Allowed whitespace is defined in RFC 7159
// http://www.rfc-editor.org/rfc/rfc7159.txt


const strictJSONReg = /^[\x20\x09\x0a\x0d]*(\[|\{)/;

function parseBody(_x3, _x4) {
  return _parseBody.apply(this, arguments);
}

function _parseBody() {
  _parseBody = _asyncToGenerator(function* (req, options) {
    // defaults
    const len = req.headers['content-length'];
    const encoding = req.headers['content-encoding'] || 'identity';

    if (encoding !== 'identity') {
      throw new Error('Supports only identity');
    }

    const length = parseInt(len);
    const str = yield raw(req, {
      limit: options.limit,
      length: length
    });

    if (!str) {
      return {};
    } // strict JSON test


    if (!strictJSONReg.test(str)) {
      throw new Error('invalid JSON, only supports object and array');
    }

    return JSON.parse(str);
  });
  return _parseBody.apply(this, arguments);
}

function raw(stream, options) {
  return new Promise(function executor(resolve, reject) {
    readStream(stream, options.length, options.limit, function onRead(err, buf) {
      if (err) return reject(err);
      resolve(buf);
    });
  });
}

function halt(stream) {
  stream.unpipe();
  stream.pause();
}

function readStream(stream, length, limit, callback) {
  let complete = false;
  let sync = true; // check the length and limit options.
  // note: we intentionally leave the stream paused,
  // so users should handle the stream themselves.

  if (length > limit) {
    return done(new Error('request entity too large'));
  }

  const decoder = new string_decoder.StringDecoder('utf8');
  let received = 0;
  let buffer = ''; // attach listeners

  stream.on('aborted', onAborted);
  stream.on('close', cleanup);
  stream.on('data', onData);
  stream.on('end', onEnd);
  stream.on('error', onEnd); // mark sync section complete

  sync = false;

  function done(err, data) {
    // mark complete
    complete = true;

    if (sync) {
      process.nextTick(invokeCallback);
    } else {
      invokeCallback();
    }

    function invokeCallback() {
      cleanup();

      if (err) {
        // halt the stream on error
        halt(stream);
      }

      callback(null, data);
    }
  }

  function onAborted() {
    if (complete) return;
    done(new Error('request aborted'));
  }

  function onData(chunk) {
    if (complete) return;
    received += chunk.length;

    if (limit !== null && received > limit) {
      done(new Error('request entity too large'));
    } else {
      buffer += decoder.write(chunk);
    }
  }

  function onEnd(err) {
    if (complete) {
      return;
    }

    if (err) {
      return done(err);
    }

    if (length !== null && received !== length) {
      done(new Error('request size did not match content length'));
    } else {
      var string = buffer + decoder.end();
      done(null, string);
    }
  }

  function cleanup() {
    buffer = null;
    stream.removeListener('aborted', onAborted);
    stream.removeListener('data', onData);
    stream.removeListener('end', onEnd);
    stream.removeListener('error', onEnd);
    stream.removeListener('close', cleanup);
  }
}

const Server = {
  create: createServer
};

function createServer(mainMiddleware, options = {}) {
  const onError = options.onError || defaultOnError;
  const httpServer = options.httpServer || http.createServer(); // const router = Router.create();
  // const apps = {};
  // const globalMiddlewares: Middlewares = [];
  // const onNoMatch: Middleware = options.onNoMatch || defaultOnNoMatch;

  const rootMiddleware = Middleware.compose(BodyParser.create(), mainMiddleware);
  const server = {
    httpServer,
    listen
  };
  return server;

  function listen(port, listeningListener) {
    httpServer.on('request', handler);
    httpServer.listen(port, listeningListener);
    return server;
  } // function use(...fns: Middlewares): Server {
  //   globalMiddlewares.push(...fns);
  //   return server; // chainable
  // }


  function defaultOnError(err, ctx) {
    const code = err.code || err.status || 500;
    const message = err.length && err || err.message || http.STATUS_CODES[code];
    return ctx.response.send({
      code,
      json: {
        message
      }
    });
  }

  function handler(_x, _x2) {
    return _handler.apply(this, arguments);
  }

  function _handler() {
    _handler = _asyncToGenerator(function* (req, res) {
      const request = yield Request.create(req);
      const response = yield Response.create(res);
      const ctx = yield Context.create(request, response);
      return Promise.resolve(mainMiddleware(ctx,
      /*#__PURE__*/
      _asyncToGenerator(function* () {
        return ctx.response.send({
          code: 500,
          json: {
            message: 'Server did not respond'
          }
        });
      }))).catch(err => {
        return onError(err, ctx);
      });
    });
    return _handler.apply(this, arguments);
  }
} // function mutate(str: string, req: http.IncomingMessage) {
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

exports.Context = Context;
exports.Middleware = Middleware;
exports.Request = Request;
exports.Response = Response;
exports.Server = Server;

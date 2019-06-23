'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var string_decoder = require('string_decoder');
var querystring = require('querystring');
var http = _interopDefault(require('http'));

(function (HttpMethod) {
  HttpMethod["ALL"] = "ALL";
  HttpMethod["GET"] = "GET";
  HttpMethod["HEAD"] = "HEAD";
  HttpMethod["PATCH"] = "PATCH";
  HttpMethod["OPTIONS"] = "OPTIONS";
  HttpMethod["CONNECT"] = "CONNECT";
  HttpMethod["DELETE"] = "DELETE";
  HttpMethod["TRACE"] = "TRACE";
  HttpMethod["POST"] = "POST";
  HttpMethod["PUT"] = "PUT";
})(exports.HttpMethod || (exports.HttpMethod = {}));

const HttpHeaders = {
  ContentLength: 'content-length',
  ContentType: 'content-type',
  ContentEncoding: 'content-encoding',
  AccessControlAllowOrigin: 'access-control-allow-origin',
  AccessControlAllowHeaders: 'access-control-allow-headers',
  Origin: 'origin'
};
const ContentType = {
  Json: 'application/json'
};
const ContentEncoding = {
  Identity: 'identity'
};

const ALL_STATUS = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',
  103: 'Early Hints',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  207: 'Multi-Status',
  208: 'Already Reported',
  226: 'IM Used',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  306: '(Unused)',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a teapot",
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Too Early',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  509: 'Bandwidth Limit Exceeded',
  510: 'Not Extended',
  511: 'Network Authentication Required'
};

function getStatus(code) {
  return {
    code,
    message: ALL_STATUS[code]
  };
}

const HttpStatus = {
  getMessage(code) {
    return ALL_STATUS[code];
  },

  get: getStatus,
  NotFound: getStatus(404),

  isEmpty(code) {
    return code < 200 || [204, 205, 304].indexOf(code) >= 0;
  }

}; // status code to message map
// status.STATUS_CODES = codes
// array of status codes
// status.codes = populateStatusesMap(status, codes)
// status codes for redirects
// status.redirect = {
//   300: true,
//   301: true,
//   302: true,
//   303: true,
//   305: true,
//   307: true,
//   308: true
// }
// status codes for empty bodies
// status.empty = {
//   204: true,
//   205: true,
//   304: true
// }
// status codes for when you should retry the request
// status.retry = {
//   502: true,
//   503: true,
//   504: true
// }
// function status (code: HttpStatusCode) {
//   if (typeof code === 'number') {
//     if (!status[code]) throw new Error('invalid status code: ' + code)
//     return code
//   }
//   if (typeof code !== 'string') {
//     throw new TypeError('code must be a number or string')
//   }
//   // '403'
//   var n = parseInt(code, 10)
//   if (!isNaN(n)) {
//     if (!status[n]) throw new Error('invalid status code: ' + n)
//     return n
//   }
//   n = status[code.toLowerCase()]
//   if (!n) throw new Error('invalid status message: "' + code + '"')
//   return n
// }

class HttpError extends Error {
  constructor(code, message) {
    super(`HttpError`);
    this.code = code;
    this.message = message || HttpStatus.getMessage(code);
    Object.setPrototypeOf(this, new.target.prototype);
  }

}

class LengthRequired extends HttpError {
  constructor() {
    super(411);
  }

}

class NotAcceptable extends HttpError {
  constructor(info) {
    super(406, `${HttpStatus.getMessage(406)}: ${info}`);
    this.info = info;
  }

}

class PayloadTooLarge extends HttpError {
  constructor() {
    super(413);
  }

}

class NotFound extends HttpError {
  constructor() {
    super(404);
  }

}

class BadRequest extends HttpError {
  constructor(info) {
    super(400, `${HttpStatus.getMessage(400)}: ${info}`);
    this.info = info;
  }

}

const HttpErrors = {
  HttpError,
  LengthRequired,
  NotAcceptable,
  PayloadTooLarge,
  BadRequest,
  NotFound
};

const BodyParser = {
  create: createBodyParser
};

function createBodyParser(options = {}) {
  const _1mb = 1024 * 1024 * 1024;

  const {
    limit = _1mb
  } = options; // Allowed whitespace is defined in RFC 7159
  // http://www.rfc-editor.org/rfc/rfc7159.txt

  const strictJSONReg = /^[\x20\x09\x0a\x0d]*(\[|\{)/;
  return async (ctx, next) => {
    const headers = ctx.request.headers;

    if (ctx.request.method === exports.HttpMethod.GET || ctx.request.method === exports.HttpMethod.DELETE || ctx.request.method === exports.HttpMethod.OPTIONS) {
      return next();
    }

    const lengthStr = headers[HttpHeaders.ContentLength];

    if (lengthStr === undefined || Array.isArray(lengthStr)) {
      throw new HttpErrors.LengthRequired();
    }

    const length = parseInt(lengthStr, 10);

    if (Number.isNaN(length)) {
      throw new HttpErrors.LengthRequired();
    }

    if (length === 0) {
      return next();
    }

    const type = headers[HttpHeaders.ContentType];

    if (type !== ContentType.Json) {
      throw new HttpErrors.NotAcceptable('Only application/json is accepeted');
    }

    const encoding = headers[HttpHeaders.ContentEncoding] || ContentEncoding.Identity;

    if (encoding !== ContentEncoding.Identity) {
      throw new HttpErrors.NotAcceptable(`${encoding} not supported`);
    }

    if (length > limit) {
      throw new HttpErrors.PayloadTooLarge();
    }

    const body = await parseBody(ctx.request.req, length, limit);
    ctx.request.body = body;
    return next();
  };

  async function parseBody(req, length, limit) {
    const str = await readStream(req, length, limit);

    if (!str) {
      return {};
    } // strict JSON test


    if (!strictJSONReg.test(str)) {
      throw new Error('invalid JSON, only supports object and array');
    }

    return JSON.parse(str);
  }

  function readStream(stream, length, limit) {
    return new Promise((resolve, reject) => {
      let complete = false;
      let sync = true;
      let received = 0;
      let buffer = '';
      const decoder = new string_decoder.StringDecoder('utf8'); // attach listeners

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
            stream.unpipe();
            stream.pause();
            return reject(err);
          }

          resolve(data);
        }
      }

      function onAborted() {
        if (complete) {
          return;
        }

        done(new Error('request aborted'));
      }

      function onData(chunk) {
        if (complete) {
          return;
        }

        received += chunk.length;

        if (received > limit) {
          done(new HttpErrors.PayloadTooLarge());
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

        if (received !== length) {
          done(new HttpErrors.HttpError(400, 'Request size did not match content length'));
        } else {
          var string = buffer + decoder.end();
          done(null, string);
        }
      }

      function cleanup() {
        buffer = '';
        stream.removeListener('aborted', onAborted);
        stream.removeListener('data', onData);
        stream.removeListener('end', onEnd);
        stream.removeListener('error', onEnd);
        stream.removeListener('close', cleanup);
      }
    });
  }
}

const Context = {
  create: createContext
};

async function createContext(request, response) {
  const context = {
    request,
    response
  };
  return context;
}

const Middleware = {
  compose
};

function compose(...middlewares) {
  return async function (ctx, next) {
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
  };
}

function notNill(maybe) {
  if (maybe === null || maybe === undefined) {
    throw Error(`Unexpected nill`);
  }

  return maybe;
}

const Request = {
  create: createRequest,
  parseUrl
};

async function createRequest(req) {
  const url = notNill(req.url); // never null because IncomingMessage come from http.Server

  const parsed = parseUrl(url);
  const method = notNill(req.method); // const route = router.find(method, parsed.pathname);
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
    body: {},
    headers: req.headers
  };
  return request;
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

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

const Response = {
  create: createResponse
};

async function createResponse(res) {
  let responseData = null;
  const response = {
    res,
    create,

    get sent() {
      return responseData !== null;
    },

    clearBody,
    __send
  };
  return response;

  function create(options = {}, config = {}) {
    const {
      force = false
    } = config;

    if (responseData !== null && force === false) {
      throw new Error(`responseData already set !`);
    }

    const {
      code = 200,
      headers = {},
      json = {}
    } = options;
    responseData = {
      code,
      headers,
      json
    };
  }

  function clearBody() {
    if (responseData) {
      delete responseData.json;
    }
  }

  function __send(ctx) {
    if (res.finished) {
      throw new Error('Response finished ?');
    }

    if (responseData === null) {
      throw new Error('No response sent !');
    }

    if (res.headersSent) {
      throw new Error('Header already sent !');
    }

    const headers = _objectSpread({}, responseData.headers);

    const isEmpty = HttpStatus.isEmpty(responseData.code) || ctx.request.method === exports.HttpMethod.HEAD || ctx.request.method === exports.HttpMethod.OPTIONS;
    const bodyStr = JSON.stringify(responseData.json);
    const length = Buffer.byteLength(bodyStr); // ignore body

    if (isEmpty === false) {
      headers[HttpHeaders.ContentLength] = length;
      headers[HttpHeaders.ContentType] = ContentType.Json;
    }

    res.writeHead(responseData.code, headers);

    if (isEmpty) {
      return res.end();
    }

    return res.end(bodyStr);
  }
}

const Server = {
  create: createServer
};

function createServer(mainMiddleware, options = {}) {
  const onError = options.onError || defaultOnError;
  const httpServer = options.httpServer || http.createServer();
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
  }

  function defaultOnError(error, ctx) {
    if (error instanceof HttpErrors.HttpError) {
      ctx.response.create({
        code: error.code,
        json: {
          code: error.code,
          message: error.message
        }
      }, {
        force: true
      });
      return;
    }

    const message = error instanceof Error ? error.message : HttpStatus.getMessage(500);
    ctx.response.create({
      code: 500,
      json: {
        code: 500,
        message
      }
    }, {
      force: true
    });
    return;
  }

  async function handler(req, res) {
    const request = await Request.create(req);
    const response = await Response.create(res);
    const ctx = await Context.create(request, response);
    return Promise.resolve(rootMiddleware(ctx, async () => {
      return defaultOnError({
        code: 500,
        message: 'Server did not respond'
      }, ctx);
    })).catch(err => {
      return onError(err, ctx);
    }).then(() => {
      if (response.sent === false) {
        defaultOnError({
          code: 500,
          message: 'Server did not respond'
        }, ctx);
      }

      response.__send(ctx);
    }).catch(err => {
      // fatal
      console.error(err);
      ctx.response.res.end();
    });
  }
}

exports.BodyParser = BodyParser;
exports.ContentEncoding = ContentEncoding;
exports.ContentType = ContentType;
exports.Context = Context;
exports.HttpErrors = HttpErrors;
exports.HttpHeaders = HttpHeaders;
exports.HttpStatus = HttpStatus;
exports.Middleware = Middleware;
exports.Request = Request;
exports.Response = Response;
exports.Server = Server;

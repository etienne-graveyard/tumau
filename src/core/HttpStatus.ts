export type HttpStatusCode = keyof typeof ALL_STATUS;

export type HttpStatusMessage = string;
export interface HttpStatus {
  code: HttpStatusCode;
  message: HttpStatusMessage;
}

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
  511: 'Network Authentication Required',
};

function getStatus(code: HttpStatusCode): HttpStatus {
  return {
    code,
    message: ALL_STATUS[code],
  };
}

export const HttpStatus = {
  getMessage(code: HttpStatusCode, details?: string): HttpStatusMessage {
    return ALL_STATUS[code] + (details ? `: ${details}` : '');
  },
  get: getStatus,
  isEmpty(code: HttpStatusCode): boolean {
    return code < 200 || [204, 205, 304].indexOf(code) >= 0;
  },
  isError(code: HttpStatusCode): boolean {
    return code >= 400;
  },
};

// status code to message map
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

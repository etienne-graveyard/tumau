export type HttpStatusCode = keyof typeof ALL_STATUS;

export type HttpStatusName = typeof ALL_STATUS[HttpStatusCode]['name'];

export type HttpStatusMessage = string;

export interface HttpStatusObject {
  code: HttpStatusCode;
  name: HttpStatusName;
  message: HttpStatusMessage;
}

const ALL_STATUS = {
  100: { message: 'Continue', name: 'Continue' },
  101: { message: 'Switching Protocols', name: 'SwitchingProtocols' },
  102: { message: 'Processing', name: 'Processing' },
  103: { message: 'Early Hints', name: 'EarlyHints' },
  200: { message: 'Ok', name: 'Ok' },
  201: { message: 'Created', name: 'Created' },
  202: { message: 'Accepted', name: 'Accepted' },
  203: { message: 'Non-Authoritative Information', name: 'NonAuthoritativeInformation' },
  204: { message: 'No Content', name: 'NoContent' },
  205: { message: 'Reset Content', name: 'ResetContent' },
  206: { message: 'Partial Content', name: 'PartialContent' },
  207: { message: 'Multi-Status', name: 'MultiStatus' },
  208: { message: 'Already Reported', name: 'AlreadyReported' },
  226: { message: 'IM Used', name: 'IMUsed' },
  300: { message: 'Multiple Choices', name: 'MultipleChoices' },
  301: { message: 'Moved Permanently', name: 'MovedPermanently' },
  302: { message: 'Found', name: 'Found' },
  303: { message: 'See Other', name: 'SeeOther' },
  304: { message: 'Not Modified', name: 'NotModified' },
  305: { message: 'Use Proxy', name: 'UseProxy' },
  307: { message: 'Temporary Redirect', name: 'TemporaryRedirect' },
  308: { message: 'Permanent Redirect', name: 'PermanentRedirect' },
  400: { message: 'Bad Request', name: 'BadRequest' },
  401: { message: 'Unauthorized', name: 'Unauthorized' },
  402: { message: 'Payment Required', name: 'PaymentRequired' },
  403: { message: 'Forbidden', name: 'Forbidden' },
  404: { message: 'Not Found', name: 'NotFound' },
  405: { message: 'Method Not Allowed', name: 'MethodNotAllowed' },
  406: { message: 'Not Acceptable', name: 'NotAcceptable' },
  407: { message: 'Proxy Authentication Required', name: 'ProxyAuthenticationRequired' },
  408: { message: 'Request Timeout', name: 'RequestTimeout' },
  409: { message: 'Conflict', name: 'Conflict' },
  410: { message: 'Gone', name: 'Gone' },
  411: { message: 'Length Required', name: 'LengthRequired' },
  412: { message: 'Precondition Failed', name: 'PreconditionFailed' },
  413: { message: 'Payload Too Large', name: 'PayloadTooLarge' },
  414: { message: 'URI Too Long', name: 'URITooLong' },
  415: { message: 'Unsupported Media Type', name: 'UnsupportedMediaType' },
  416: { message: 'Range Not Satisfiable', name: 'RangeNotSatisfiable' },
  417: { message: 'Expectation Failed', name: 'ExpectationFailed' },
  418: { message: "I'm a teapot", name: 'Teapot' },
  421: { message: 'Misdirected Request', name: 'MisdirectedRequest' },
  422: { message: 'Unprocessable Entity', name: 'UnprocessableEntity' },
  423: { message: 'Locked', name: 'Locked' },
  424: { message: 'Failed Dependency', name: 'Failed Dependency' },
  425: { message: 'Too Early', name: 'TooEarly' },
  426: { message: 'Upgrade Required', name: 'UpgradeRequired' },
  428: { message: 'Precondition Required', name: 'PreconditionRequired' },
  429: { message: 'Too Many Requests', name: 'TooManyRequests' },
  431: { message: 'Request Header Fields Too Large', name: 'RequestHeaderFieldsTooLarge' },
  451: { message: 'Unavailable For Legal Reasons', name: 'UnavailableForLegalReasons' },
  500: { message: 'Internal Server Error', name: 'InternalServerError' },
  501: { message: 'Not Implemented', name: 'NotImplemented' },
  502: { message: 'Bad Gateway', name: 'BadGateway' },
  503: { message: 'Service Unavailable', name: 'ServiceUnavailable' },
  504: { message: 'Gateway Timeout', name: 'GatewayTimeout' },
  505: { message: 'HTTP Version Not Supported', name: 'HTTPVersionNotSupported' },
  506: { message: 'Variant Also Negotiates', name: 'VariantAlsoNegotiates' },
  507: { message: 'Insufficient Storage', name: 'InsufficientStorage' },
  508: { message: 'Loop Detected', name: 'LoopDetected' },
  509: { message: 'Bandwidth Limit Exceeded', name: 'BandwidthLimitExceeded' },
  510: { message: 'Not Extended', name: 'NotExtended' },
  511: { message: 'Network Authentication Required', name: 'NetworkAuthenticationRequired' },
};

const ALL_STATUS_BY_CODE: { [K in HttpStatusCode]: HttpStatusObject } = Object.fromEntries(
  Object.entries(ALL_STATUS).map(([code, infos]) => [code, { code, ...infos }])
) as any;

const ALL_STATUS_BY_NAME: { [K in HttpStatusName]: HttpStatusObject } = Object.fromEntries(
  Object.entries(ALL_STATUS).map(([code, infos]) => [infos.name, { code, ...infos }])
) as any;

export const HttpStatus = {
  getMessage(code: HttpStatusCode, details?: string): HttpStatusMessage {
    return ALL_STATUS[code] + (details ? `: ${details}` : '');
  },
  fromCode(code: HttpStatusCode): HttpStatusObject {
    const obj = ALL_STATUS_BY_CODE[code];
    if (!obj) {
      throw new Error(`Unknown status code: ${code}`);
    }
    return obj;
  },
  fromName(name: HttpStatusName): HttpStatusObject {
    const obj = ALL_STATUS_BY_NAME[name];
    if (!obj) {
      throw new Error(`Unknown status name: ${name}`);
    }
    return obj;
  },
  isEmpty(code: HttpStatusCode): boolean {
    return code < 200 || [204, 205, 304].indexOf(code) >= 0;
  },
  isError(code: HttpStatusCode): boolean {
    return code >= 400;
  },
};

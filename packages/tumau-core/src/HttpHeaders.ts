export const HttpHeaders = {
  Accept: 'accept',
  AcceptEncoding: 'accept-encoding',
  AccessControlAllowCredentials: 'access-control-allow-credentials',
  AccessControlAllowHeaders: 'access-control-allow-headers',
  AccessControlAllowMethods: 'access-control-allow-methods',
  AccessControlAllowOrigin: 'access-control-allow-origin',
  AccessControlExposeHeaders: 'access-control-expose-headers',
  AccessControlMaxAge: 'access-control-max-age',
  AccessControlRequestHeaders: 'access-control-request-headers',
  AccessControlRequestMethod: 'access-control-request-method',
  Allow: 'allow',
  Authorization: 'authorization',
  ContentEncoding: 'content-encoding',
  ContentLength: 'content-length',
  ContentType: 'content-type',
  Cookie: 'cookie',
  Location: 'location',
  Origin: 'origin',
  SetCookie: 'set-cookie',
  XHTTPMethodOverride: 'x-http-method-override',
  XRequestedWith: 'x-requested-with',
} as const;

export type HttpHeadersName = typeof HttpHeaders[keyof typeof HttpHeaders];

export const ContentType = {
  Html: 'text/html',
  Json: 'application/json',
  Text: 'text/plain',
} as const;

export const ContentTypeCharset = {
  Utf8: 'charset=utf-8',
} as const;

export const ContentEncoding = {
  Brotli: 'br',
  Deflate: 'deflate',
  Gzip: 'gzip',
  Identity: 'identity',
} as const;

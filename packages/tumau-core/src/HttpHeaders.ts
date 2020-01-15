export const HttpHeaders = {
  ContentLength: 'content-length',
  ContentType: 'content-type',
  ContentEncoding: 'content-encoding',
  AcceptEncoding: 'accept-encoding',
  AccessControlRequestMethod: 'access-control-request-method',
  AccessControlRequestHeaders: 'access-control-request-headers',
  AccessControlAllowOrigin: 'access-control-allow-origin',
  AccessControlAllowHeaders: 'access-control-allow-headers',
  AccessControlAllowMethods: 'access-control-allow-methods',
  AccessControlAllowCredentials: 'access-control-allow-credentials',
  AccessControlExposeHeaders: 'access-control-expose-headers',
  AccessControlMaxAge: 'access-control-max-age',
  Location: 'location',
  Origin: 'origin',
  Allow: 'allow',
  Cookie: 'cookie',
  SetCookie: 'set-cookie',
} as const;

export const ContentType = {
  Json: 'application/json',
  Text: 'text/plain',
  Html: 'text/html',
} as const;

export const ContentTypeCharset = {
  Utf8: 'charset=utf-8',
} as const;

export const ContentEncoding = {
  Identity: 'identity',
  Brotli: 'br',
  Deflate: 'deflate',
  Gzip: 'gzip',
} as const;

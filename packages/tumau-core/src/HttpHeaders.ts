export const HttpHeaders = {
  ContentLength: 'content-length' as const,
  ContentType: 'content-type' as const,
  ContentEncoding: 'content-encoding' as const,
  AcceptEncoding: 'accept-encoding' as const,
  AccessControlAllowOrigin: 'access-control-allow-origin' as const,
  AccessControlAllowHeaders: 'access-control-allow-headers' as const,
  Location: 'location' as const,
  Origin: 'origin' as const,
};

export const ContentType = {
  Json: 'application/json' as const,
  Text: 'text/plain' as const,
  Html: 'text/html' as const,
};

export const ContentTypeCharset = {
  Utf8: 'charset=utf-8' as const,
};

export const ContentEncoding = {
  Identity: 'identity' as const,
  Brotli: 'br' as const,
  Deflate: 'deflate' as const,
  Gzip: 'gzip' as const,
};

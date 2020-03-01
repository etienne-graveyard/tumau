import { TumauResponse, HttpHeaders } from '@tumau/core';
import { OutgoingHttpHeaders } from 'http';

interface CorsConfigResolved {
  allowOrigin: string;
  allowCredentials: boolean;
  exposeHeaders: Array<string> | null;
  allowHeaders: Array<string> | null;
  allowMethods: Array<string> | null;
  maxAge: number | null;
}

export class CorsPreflightResponse extends TumauResponse {
  public cors: CorsConfigResolved;

  constructor(cors: CorsConfigResolved) {
    super({ headers: getCorsHeader(cors) });
    this.cors = cors;
  }
}

function getCorsHeader(cors: CorsConfigResolved): OutgoingHttpHeaders {
  const headers: OutgoingHttpHeaders = {};

  if (cors.allowOrigin) {
    headers[HttpHeaders.AccessControlAllowOrigin] = cors.allowOrigin;
  }
  if (cors.allowCredentials) {
    headers[HttpHeaders.AccessControlAllowCredentials] = 'true';
  }
  if (cors.maxAge) {
    headers[HttpHeaders.AccessControlMaxAge] = cors.maxAge;
  }
  if (cors.allowMethods) {
    headers[HttpHeaders.AccessControlAllowMethods] = cors.allowMethods.join(', ');
  }
  if (cors.allowHeaders) {
    headers[HttpHeaders.AccessControlAllowHeaders] = cors.allowHeaders.join(', ');
  }
  if (cors.exposeHeaders) {
    headers[HttpHeaders.AccessControlExposeHeaders] = cors.exposeHeaders.join(', ');
  }
  return headers;
}

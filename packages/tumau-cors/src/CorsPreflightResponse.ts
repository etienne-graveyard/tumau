import { TumauResponse, HttpHeaders } from '@tumau/core';
import { OutgoingHttpHeaders } from 'http';
import { CorsPreflightConfigResolved } from './utils';

export class CorsPreflightResponse extends TumauResponse {
  public cors: CorsPreflightConfigResolved;

  constructor(config: CorsPreflightConfigResolved) {
    super({ headers: getCorsHeader(config) });
    this.cors = config;
  }
}

function getCorsHeader(cors: CorsPreflightConfigResolved): OutgoingHttpHeaders {
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

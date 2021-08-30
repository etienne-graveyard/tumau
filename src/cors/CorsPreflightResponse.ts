import { TumauResponse, HttpHeaders } from '../core';
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
  if (cors.maxAge !== null) {
    headers[HttpHeaders.AccessControlMaxAge] = cors.maxAge;
  }
  if (cors.allowMethods && cors.allowMethods.length > 0) {
    headers[HttpHeaders.AccessControlAllowMethods] = cors.allowMethods.join(', ');
  }
  if (cors.allowHeaders && cors.allowHeaders.length > 0) {
    headers[HttpHeaders.AccessControlAllowHeaders] = cors.allowHeaders.join(', ');
  }
  if (cors.exposeHeaders && cors.exposeHeaders.length > 0) {
    headers[HttpHeaders.AccessControlExposeHeaders] = cors.exposeHeaders.join(', ');
  }
  return headers;
}

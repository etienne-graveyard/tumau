import { TumauResponse, HttpHeader } from '../core';
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
    headers[HttpHeader.AccessControlAllowOrigin] = cors.allowOrigin;
  }
  if (cors.allowCredentials) {
    headers[HttpHeader.AccessControlAllowCredentials] = 'true';
  }
  if (cors.maxAge !== null) {
    headers[HttpHeader.AccessControlMaxAge] = cors.maxAge;
  }
  if (cors.allowMethods && cors.allowMethods.length > 0) {
    headers[HttpHeader.AccessControlAllowMethods] = cors.allowMethods.join(', ');
  }
  if (cors.allowHeaders && cors.allowHeaders.length > 0) {
    headers[HttpHeader.AccessControlAllowHeaders] = cors.allowHeaders.join(', ');
  }
  if (cors.exposeHeaders && cors.exposeHeaders.length > 0) {
    headers[HttpHeader.AccessControlExposeHeaders] = cors.exposeHeaders.join(', ');
  }
  return headers;
}

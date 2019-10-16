import { TumauResponse, HttpHeaders } from '@tumau/core';
import { CorsContext } from './CorsContext';
import { OutgoingHttpHeaders } from 'http';

export class CorsResponse extends TumauResponse {
  public originalResponse: TumauResponse;
  public cors: CorsContext;

  constructor(originalResponse: TumauResponse, cors: CorsContext) {
    const headers: OutgoingHttpHeaders = {};

    if (cors.allowOrigin !== null) {
      headers[HttpHeaders.AccessControlAllowOrigin] = cors.allowOrigin;
    }
    if (cors.allowCredentials) {
      headers[HttpHeaders.AccessControlAllowCredentials] = 'true';
    }
    if (cors.maxAge) {
      headers[HttpHeaders.AccessControlMaxAge] = cors.maxAge;
    }
    if (cors.allowMethods) {
      headers[HttpHeaders.AccessControlAllowMethods] = Array.from(cors.allowMethods).join(', ');
    }
    if (cors.allowHeaders) {
      headers[HttpHeaders.AccessControlAllowHeaders] = Array.from(cors.allowHeaders).join(', ');
    }
    if (cors.exposeHeaders) {
      headers[HttpHeaders.AccessControlExposeHeaders] = Array.from(cors.exposeHeaders).join(', ');
    }

    super(originalResponse.extends({ headers }));
    this.originalResponse = originalResponse;
    this.cors = cors;
  }
}

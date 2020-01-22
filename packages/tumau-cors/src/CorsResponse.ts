import { TumauResponse, HttpHeaders, HttpError } from '@tumau/core';
import { CorsConfig } from './CorsConfig';
import { OutgoingHttpHeaders } from 'http';

export class CorsResponse extends TumauResponse {
  public originalResponse: TumauResponse;
  public cors: CorsConfig;

  constructor(originalResponse: TumauResponse, cors: CorsConfig) {
    if (originalResponse instanceof TumauResponse === false) {
      throw new HttpError.Internal('originalResponse is expected to be a TumauResponse instance');
    }
    super(originalResponse.extends({ headers: CorsResponse.getCorsHeader(cors) }));
    this.originalResponse = originalResponse;
    this.cors = cors;
  }

  public static fromResponse(
    originalResponse: TumauResponse | null,
    cors: CorsConfig
  ): CorsResponse | TumauResponse | null {
    const resResolved = originalResponse === null ? TumauResponse.noContent() : originalResponse;
    const headers = CorsResponse.getCorsHeader(cors);
    if (Object.keys(headers).length === 0) {
      return originalResponse;
    }
    return new CorsResponse(resResolved, cors);
  }

  public static getCorsHeader(cors: CorsConfig): OutgoingHttpHeaders {
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
    return headers;
  }
}

import { TumauResponse, HttpHeaders, HttpError } from '@tumau/core';
import { OutgoingHttpHeaders } from 'http';

interface CorsConfigResolved {
  allowOrigin: string;
  allowCredentials: boolean;
  exposeHeaders: Array<string> | null;
}

export class CorsActualResponse extends TumauResponse {
  public originalResponse: TumauResponse;
  public cors: CorsConfigResolved;

  constructor(originalResponse: TumauResponse, cors: CorsConfigResolved) {
    if (originalResponse instanceof TumauResponse === false) {
      throw new HttpError.Internal('originalResponse is expected to be a TumauResponse instance');
    }
    super(originalResponse.extends({ headers: getCorsHeader(cors) }));
    this.originalResponse = originalResponse;
    this.cors = cors;
  }

  public static fromResponse(
    originalResponse: TumauResponse | null,
    cors: CorsConfigResolved
  ): CorsActualResponse | TumauResponse | null {
    const resResolved = originalResponse === null ? TumauResponse.noContent() : originalResponse;
    const headers = getCorsHeader(cors);
    if (Object.keys(headers).length === 0) {
      return originalResponse;
    }
    return new CorsActualResponse(resResolved, cors);
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
  if (cors.exposeHeaders) {
    headers[HttpHeaders.AccessControlExposeHeaders] = cors.exposeHeaders.join(', ');
  }
  return headers;
}

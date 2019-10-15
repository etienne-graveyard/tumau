import { Response, HttpMethod, HttpHeaders } from '@tumau/core';

export class AllowedMethodsResponse extends Response {
  public originalResponse: Response;
  public allowedMethods: Set<HttpMethod>;

  constructor(originalResponse: Response, allowedMethods: Set<HttpMethod>) {
    const allowHeaderContent = Array.from(allowedMethods.values()).join(',');

    super({
      body: originalResponse.body,
      code: originalResponse.code,
      headers: {
        ...originalResponse.headers,
        [HttpHeaders.Allow]: allowHeaderContent,
      },
    });
    this.originalResponse = originalResponse;
    this.allowedMethods = allowedMethods;
  }
}

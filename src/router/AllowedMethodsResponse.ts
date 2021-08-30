import { TumauResponse, HttpMethod, HttpHeaders } from '../core';

export class AllowedMethodsResponse extends TumauResponse {
  public originalResponse: TumauResponse;
  public allowedMethods: Set<HttpMethod>;

  constructor(originalResponse: TumauResponse, allowedMethods: Set<HttpMethod>) {
    const allowHeaderContent = Array.from(allowedMethods.values()).join(',');

    super(
      originalResponse.extends({
        headers: {
          [HttpHeaders.Allow]: allowHeaderContent,
        },
      })
    );
    this.originalResponse = originalResponse;
    this.allowedMethods = allowedMethods;
  }
}

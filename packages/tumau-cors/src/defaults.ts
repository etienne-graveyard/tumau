import { HttpMethod, HttpHeaders, HttpHeadersName } from '@tumau/core';

export const DEFAULT_ALLOW_METHODS: Array<HttpMethod> = [
  HttpMethod.POST,
  HttpMethod.GET,
  HttpMethod.PUT,
  HttpMethod.PATCH,
  HttpMethod.DELETE,
  HttpMethod.OPTIONS,
];

export const DEFAULT_ALLOW_HEADERS: Array<HttpHeadersName> = [
  HttpHeaders.XRequestedWith,
  HttpHeaders.AccessControlAllowOrigin,
  HttpHeaders.XHTTPMethodOverride,
  HttpHeaders.ContentType,
  HttpHeaders.Authorization,
  HttpHeaders.Accept,
];

export const DEFAULT_EXPOSE_HEADERS: Array<HttpHeadersName> = [];

export const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours

export const DEFAULT_ALLOW_ORIGIN = ['*'];

export const DEFAULT_ALLOW_CREDENTIALS = false;

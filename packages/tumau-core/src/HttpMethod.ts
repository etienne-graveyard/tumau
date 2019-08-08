export enum HttpMethod {
  GET = 'GET',
  HEAD = 'HEAD',
  PATCH = 'PATCH',
  OPTIONS = 'OPTIONS',
  DELETE = 'DELETE',
  POST = 'POST',
  PUT = 'PUT',
}

export const ALL_HTTP_METHODS: Set<HttpMethod> = new Set(Object.keys(HttpMethod).map(k => HttpMethod[k as any]) as any);

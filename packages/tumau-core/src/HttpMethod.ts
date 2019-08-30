export const HttpMethod = {
  GET: 'GET' as const,
  HEAD: 'HEAD' as const,
  PATCH: 'PATCH' as const,
  OPTIONS: 'OPTIONS' as const,
  DELETE: 'DELETE' as const,
  POST: 'POST' as const,
  PUT: 'PUT' as const,
};

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];

export const ALL_HTTP_METHODS: Set<HttpMethod> = new Set((Object.keys(HttpMethod) as Array<
  keyof typeof HttpMethod
>).map((k: keyof typeof HttpMethod) => HttpMethod[k]) as any);

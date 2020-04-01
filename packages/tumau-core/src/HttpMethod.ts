const AllHttpMethod = {
  GET: 'GET' as const,
  HEAD: 'HEAD' as const,
  PATCH: 'PATCH' as const,
  OPTIONS: 'OPTIONS' as const,
  DELETE: 'DELETE' as const,
  POST: 'POST' as const,
  PUT: 'PUT' as const,
};

export type HttpMethod = typeof AllHttpMethod[keyof typeof AllHttpMethod];

const ALL_HTTP_METHODS: Set<HttpMethod> = new Set(
  (Object.keys(AllHttpMethod) as Array<keyof typeof AllHttpMethod>).map(
    (k: keyof typeof AllHttpMethod) => AllHttpMethod[k]
  ) as any
);

export const HttpMethod = {
  ...AllHttpMethod,
  __ALL: ALL_HTTP_METHODS,
};

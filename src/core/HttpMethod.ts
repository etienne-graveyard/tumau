const AllHttpMethod = {
  GET: 'GET',
  HEAD: 'HEAD',
  PATCH: 'PATCH',
  OPTIONS: 'OPTIONS',
  DELETE: 'DELETE',
  POST: 'POST',
  PUT: 'PUT',
} as const;

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

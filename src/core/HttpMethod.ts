const ALL_METHODS = {
  GET: 'GET',
  HEAD: 'HEAD',
  PATCH: 'PATCH',
  OPTIONS: 'OPTIONS',
  DELETE: 'DELETE',
  POST: 'POST',
  PUT: 'PUT',
} as const;

export type HttpMethod = typeof ALL_METHODS[keyof typeof ALL_METHODS];

const ALL_HTTP_METHODS: Set<HttpMethod> = new Set(
  (Object.keys(ALL_METHODS) as Array<keyof typeof ALL_METHODS>).map(
    (k: keyof typeof ALL_METHODS) => ALL_METHODS[k]
  ) as any
);

export const HttpMethod = {
  ...ALL_METHODS,
  __ALL: ALL_HTTP_METHODS,
};

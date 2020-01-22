import { HttpMethod } from '@tumau/core';

export const DEFAULT_CORS_CONTEXT: CorsConfig = {
  allowOrigin: null,
  allowMethods: null,
  allowCredentials: false,
  allowHeaders: null,
  exposeHeaders: null,
  maxAge: null,
};

export interface CorsConfig {
  allowOrigin: string | null;
  allowMethods: Set<HttpMethod> | null;
  allowHeaders: Set<string> | null;
  exposeHeaders: Set<string> | null;
  maxAge: number | null;
  allowCredentials: boolean;
}

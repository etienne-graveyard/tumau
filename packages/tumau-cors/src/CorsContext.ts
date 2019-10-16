import { Context, HttpMethod } from '@tumau/core';

export const DEFAULT_CORS_CONTEXT: CorsContext = {
  allowOrigin: null,
  allowMethods: null,
  allowCredentials: false,
  allowHeaders: null,
  exposeHeaders: null,
  maxAge: null,
};

export interface CorsContext {
  allowOrigin: string | null;
  allowMethods: Set<HttpMethod> | null;
  allowHeaders: Set<string> | null;
  exposeHeaders: Set<string> | null;
  maxAge: number | null;
  allowCredentials: boolean;
}

export const CorsContext = Context.create<CorsContext>('Cors');
export const CorsContextConsumer = CorsContext.Consumer;

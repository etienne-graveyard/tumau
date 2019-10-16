import { Middleware, Context, HttpMethod, RequestContext, TumauResponse, HttpHeaders } from '@tumau/core';
import { CorsResponse } from './CorsResponse';
import { CorsContext, DEFAULT_CORS_CONTEXT } from './CorsContext';

type ValOrFn<T> = T | ((ctx: Context) => T);

interface Config {
  allowOrigin?: ValOrFn<string | null>;
  allowMethods?: ValOrFn<Set<HttpMethod> | null>;
  allowHeaders?: ValOrFn<Set<string> | null>;
  exposeHeaders?: ValOrFn<Set<string> | null>;
  maxAge?: ValOrFn<number | null>;
  allowCredentials?: ValOrFn<boolean>;
}

function resolveFunction<T>(ctx: Context, option: ValOrFn<T>): T {
  return typeof option === 'function' ? (option as any)(ctx) : option;
}

const DEFAULT_ALLOW_METHODS = new Set([
  HttpMethod.GET,
  HttpMethod.HEAD,
  HttpMethod.PUT,
  HttpMethod.POST,
  HttpMethod.DELETE,
  HttpMethod.PATCH,
]);

export function createCorsMiddleware(config: Config = {}): Middleware {
  return async (ctx, next) => {
    const request = ctx.getOrThrow(RequestContext);
    const origin = request.origin;
    const allowOrigin: string | null =
      config.allowOrigin === undefined ? origin : resolveFunction(ctx, config.allowOrigin);
    const allowMethods: Set<HttpMethod> | null =
      config.allowMethods === undefined ? DEFAULT_ALLOW_METHODS : resolveFunction(ctx, config.allowMethods);
    const allowHeaders: Set<string> | null =
      config.allowHeaders === undefined ? null : resolveFunction(ctx, config.allowHeaders);
    const exposeHeaders: Set<string> | null =
      config.exposeHeaders === undefined ? null : resolveFunction(ctx, config.exposeHeaders);
    const maxAge: number | null = config.maxAge === undefined ? null : resolveFunction(ctx, config.maxAge);
    const allowCredentials: boolean =
      config.allowCredentials === undefined ? false : resolveFunction(ctx, config.allowCredentials);

    const corsContext: CorsContext = {
      allowOrigin,
      allowMethods,
      allowHeaders,
      exposeHeaders,
      maxAge,
      allowCredentials,
    };

    const res = (await next(ctx.set(CorsContext.provide(corsContext)))) || TumauResponse.noContent();
    const isPreflight = request.method === HttpMethod.OPTIONS;
    if (isPreflight === false) {
      // Simple Cross-Origin Request, Actual Request, and Redirects
      return new CorsResponse(res, {
        ...DEFAULT_CORS_CONTEXT,
        allowOrigin: corsContext.allowOrigin,
        allowCredentials: corsContext.allowCredentials,
        exposeHeaders: corsContext.exposeHeaders,
      });
    }
    // Preflight Request
    const requestMethods = request.headers[HttpHeaders.AccessControlRequestMethod];
    if (requestMethods === undefined) {
      // this not preflight request, ignore it
      return res;
    }
    if (corsContext.allowOrigin === null) {
      return res;
    }
    let allowHeadersOut: Set<string> | null = corsContext.allowHeaders;
    if (!allowHeadersOut) {
      const requestHeaders = request.headers[HttpHeaders.AccessControlRequestHeaders];
      if (requestHeaders) {
        allowHeadersOut = new Set(Array.isArray(requestHeaders) ? requestHeaders : [requestHeaders]);
      }
    }

    // set headers
    return new CorsResponse(res, {
      ...corsContext,
      allowHeaders: allowHeadersOut,
      // don't Access-Control-Expose-Headers on preflight
      exposeHeaders: null,
    });
  };
}

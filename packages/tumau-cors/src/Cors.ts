import { Middleware, Tools, HttpMethod, RequestConsumer, TumauResponse, HttpHeaders, HttpError } from '@tumau/core';
import { CorsResponse } from './CorsResponse';
import { CorsContext } from './CorsContext';
import { CorsManager } from './CorsManager';
import { CorsConfig, DEFAULT_CORS_CONTEXT } from './CorsConfig';

type ValOrFn<T> = T | ((tools: Tools) => T);

export interface Config {
  allowOrigin?: ValOrFn<string | null>;
  allowMethods?: ValOrFn<Set<HttpMethod> | null>;
  allowHeaders?: ValOrFn<Set<string> | null>;
  exposeHeaders?: ValOrFn<Set<string> | null>;
  maxAge?: ValOrFn<number | null>;
  allowCredentials?: ValOrFn<boolean>;
}

function resolveFunction<T>(tools: Tools, option: ValOrFn<T>): T {
  return typeof option === 'function' ? (option as any)(tools) : option;
}

const DEFAULT_ALLOW_METHODS = new Set([
  HttpMethod.GET,
  HttpMethod.HEAD,
  HttpMethod.PUT,
  HttpMethod.POST,
  HttpMethod.DELETE,
  HttpMethod.PATCH,
]);

export function Cors(config: Config = {}): Middleware {
  return async tools => {
    const request = tools.readContextOrFail(RequestConsumer);
    const origin = request.origin;
    const allowOrigin: string | null =
      config.allowOrigin === undefined ? origin : resolveFunction(tools, config.allowOrigin);
    const allowMethods: Set<HttpMethod> | null =
      config.allowMethods === undefined ? DEFAULT_ALLOW_METHODS : resolveFunction(tools, config.allowMethods);
    const allowHeaders: Set<string> | null =
      config.allowHeaders === undefined ? null : resolveFunction(tools, config.allowHeaders);
    const exposeHeaders: Set<string> | null =
      config.exposeHeaders === undefined ? null : resolveFunction(tools, config.exposeHeaders);
    const maxAge: number | null = config.maxAge === undefined ? null : resolveFunction(tools, config.maxAge);
    const allowCredentials: boolean =
      config.allowCredentials === undefined ? false : resolveFunction(tools, config.allowCredentials);

    const corsConf: CorsConfig = {
      allowOrigin,
      allowMethods,
      allowHeaders,
      exposeHeaders,
      maxAge,
      allowCredentials,
    };

    const manager = CorsManager.create(corsConf);

    const response = await tools.withContext(CorsContext.Provider(manager)).next();
    if (request.isUpgrade) {
      return response;
    }
    if (response instanceof TumauResponse === false) {
      throw new HttpError.Internal(`Cors received an invalid response !`);
    }
    const res = response as TumauResponse | null;
    const conf = manager.current;

    const isPreflight = request.method === HttpMethod.OPTIONS;
    if (isPreflight === false) {
      // Simple Cross-Origin Request, Actual Request, and Redirects
      return CorsResponse.fromResponse(res, {
        ...DEFAULT_CORS_CONTEXT,
        allowOrigin: conf.allowOrigin,
        allowCredentials: conf.allowCredentials,
        exposeHeaders: conf.exposeHeaders,
      });
    }
    // Maybe Preflight Request
    const requestMethods = request.headers[HttpHeaders.AccessControlRequestMethod];
    if (requestMethods === undefined) {
      // this is not preflight request, ignore it
      return res;
    }
    if (conf.allowOrigin === null) {
      return res;
    }
    let allowHeadersOut: Set<string> | null = conf.allowHeaders;
    if (!allowHeadersOut) {
      const requestHeaders = request.headers[HttpHeaders.AccessControlRequestHeaders];
      if (requestHeaders) {
        allowHeadersOut = new Set(Array.isArray(requestHeaders) ? requestHeaders : [requestHeaders]);
      }
    }

    // set headers
    return CorsResponse.fromResponse(res, {
      ...conf,
      allowHeaders: allowHeadersOut,
      // don't Access-Control-Expose-Headers on preflight
      exposeHeaders: null,
    });
  };
}

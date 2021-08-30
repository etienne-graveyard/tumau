import {
  DEFAULT_ALLOW_HEADERS,
  DEFAULT_ALLOW_METHODS,
  DEFAULT_ALLOW_ORIGIN,
  DEFAULT_MAX_AGE_SECONDS,
  DEFAULT_ALLOW_CREDENTIALS,
  DEFAULT_EXPOSE_HEADERS,
} from './defaults';

type OriginMatcher = (requestOrigin: string | null | undefined) => boolean;

export function createOriginMatcher(allowedOrigins: Array<string | RegExp>): OriginMatcher {
  // pre-compile list of matchers, so regexes are only built once
  const matchers = allowedOrigins.map(createSingleOriginMatcher);
  // does a given request Origin match the list?
  return (requestOrigin: string | null | undefined) => {
    if (requestOrigin) {
      return matchers.some((matcher) => matcher(requestOrigin));
    } else {
      return false;
    }
  };
}

function createSingleOriginMatcher(allowedOrigin: string | RegExp): (origin: string) => boolean {
  if (allowedOrigin instanceof RegExp) {
    return (requestOrigin) => Boolean(requestOrigin.match(allowedOrigin));
  } else if (allowedOrigin.indexOf('*') === -1) {
    // simple string comparison
    return (requestOrigin) => requestOrigin === allowedOrigin;
  } else {
    // need to build a regex *.foo.com
    const regex = '^' + allowedOrigin.replace('.', '\\.').replace('*', '.*') + '$';
    return (requestOrigin) => Boolean(requestOrigin.match(regex));
  }
}

export interface CorsActualConfig {
  allowOrigin?: Array<string | RegExp>;
  allowCredentials?: boolean;
  exposeHeaders?: Array<string>;
}

export interface CorsPreflightConfig extends CorsActualConfig {
  allowMethods?: Array<string>;
  allowHeaders?: Array<string>;
  maxAge?: number;
}

export interface CorsActualConfigResolved {
  allowOrigin: string;
  allowCredentials: boolean;
  exposeHeaders: Array<string>;
}

export interface CorsPreflightConfigResolved extends CorsActualConfigResolved {
  allowHeaders: Array<string> | null;
  allowMethods: Array<string> | null;
  maxAge: number | null;
}

export function createActualConfigResolver(
  config: CorsActualConfig
): (origin: string | null | undefined) => CorsActualConfigResolved | false {
  const {
    allowOrigin = DEFAULT_ALLOW_ORIGIN,
    allowCredentials = DEFAULT_ALLOW_CREDENTIALS,
    exposeHeaders = DEFAULT_EXPOSE_HEADERS,
  } = config;
  const originMatcher = createOriginMatcher(allowOrigin);
  return (origin: string | null | undefined): CorsActualConfigResolved | false => {
    if (!origin || !originMatcher(origin)) {
      return false;
    }
    return {
      allowOrigin: origin,
      allowCredentials,
      exposeHeaders,
    };
  };
}

export function createPreflightConfigResolver(
  config: CorsPreflightConfig
): (origin: string | null | undefined) => CorsPreflightConfigResolved | false {
  const actualResolver = createActualConfigResolver(config);
  return (origin: string | null | undefined): CorsPreflightConfigResolved | false => {
    const actual = actualResolver(origin);
    if (actual === false) {
      return false;
    }
    const {
      allowHeaders = DEFAULT_ALLOW_HEADERS,
      allowMethods = DEFAULT_ALLOW_METHODS,
      maxAge = DEFAULT_MAX_AGE_SECONDS,
    } = config;

    return {
      ...actual,
      allowHeaders,
      allowMethods,
      maxAge,
    };
  };
}

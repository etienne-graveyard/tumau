export function createOriginMatcher(allowedOrigins: Array<string | RegExp>) {
  // pre-compile list of matchers, so regexes are only built once
  const matchers = allowedOrigins.map(createSingleOriginMatcher);
  // does a given request Origin match the list?
  return (requestOrigin: string | null | undefined) => {
    if (requestOrigin) {
      return matchers.some(matcher => matcher(requestOrigin));
    } else {
      return false;
    }
  };
}

function createSingleOriginMatcher(allowedOrigin: string | RegExp): (origin: string) => boolean {
  if (allowedOrigin instanceof RegExp) {
    return requestOrigin => Boolean(requestOrigin.match(allowedOrigin));
  } else if (allowedOrigin.indexOf('*') === -1) {
    // simple string comparison
    return requestOrigin => requestOrigin === allowedOrigin;
  } else {
    // need to build a regex
    const regex = '^' + allowedOrigin.replace('.', '\\.').replace('*', '.*') + '$';
    return requestOrigin => Boolean(requestOrigin.match(regex));
  }
}

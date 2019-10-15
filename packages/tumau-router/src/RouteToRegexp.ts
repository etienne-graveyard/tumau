interface ParseResult {
  keys: Array<string>;
  regexp: RegExp;
}

interface CacheItem {
  keys: Array<string>;
  regexpExact: RegExp;
  regexpNotExact: RegExp;
}

export const RouteToRegexp = {
  parse: parseRoute,
  CACHE: new Map<string, CacheItem>(),
};

function parseRoute(str: string, exact: boolean = true): ParseResult {
  const cache = RouteToRegexp.CACHE.get(str);
  if (cache) {
    return {
      keys: cache.keys,
      regexp: exact ? cache.regexpExact : cache.regexpNotExact,
    };
  }

  let c: string,
    o: number,
    tmp: any,
    ext: number,
    pattern = '';
  const keys = [];
  const arr = str.split('/');

  arr[0] || arr.shift();

  while ((tmp = arr.shift())) {
    c = tmp[0];
    if (tmp === '*') {
      keys.push('wild');
      pattern += '/(.*)';
    } else if (tmp === '*?') {
      keys.push('wild');
      pattern += '(\\/(?:.*))?';
    } else if (c === ':') {
      o = tmp.indexOf('?', 1);
      ext = tmp.indexOf('.', 1);
      keys.push(tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length));
      pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
      if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    } else {
      pattern += '/' + tmp;
    }
  }

  const regexpExact = new RegExp('^' + pattern + '/?$', 'i');
  const regexpNotExact = new RegExp('^' + pattern + '(?:$|/)', 'i');

  // After 1000 we don't cache anymore
  // but we keep the 1000 first
  if (RouteToRegexp.CACHE.size < 1000) {
    RouteToRegexp.CACHE.set(str, {
      keys,
      regexpExact,
      regexpNotExact,
    });
  }

  return {
    keys: keys,
    regexp: exact ? regexpExact : regexpNotExact,
  };
}

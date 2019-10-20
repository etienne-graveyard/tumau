import { Context, ContextConsumer, ContextProviderFn, ContextProvider } from '@tumau/core';

type ValidateResult<T> = { match: false } | { match: true; value: T; next: Array<string> };

type Validate<T> = (...parts: Array<string>) => ValidateResult<T>;

export interface PartObject<N extends string, T> {
  name: N;
  validate: Validate<T>;
}

type Part = string | PartObject<any, any> | RoutePattern<any>;

type Params<T> = T extends string
  ? {}
  : T extends RoutePattern<infer P>
  ? P
  : T extends PartObject<infer N, infer P>
  ? { [K in N]: P }
  : {};

const IS_PATTERN = Symbol('IS_PATTERN');

export interface RoutePattern<Params = any> {
  parts: Array<Part>;
  [IS_PATTERN]: ContextProviderFn<Params, false>;
  Consumer: ContextConsumer<Params, false>;
}

export const RoutePattern = {
  create: createPattern,
  parse: parsePattern,
  is: isPattern,
  match: matchPattern,
  splitPathname,
  // parts
  number,
  string,
  constant,
  optional,
  optionalConst,
  multiple,
};

type In = Part | RoutePattern<any>;

function isPattern(maybe: any): maybe is RoutePattern<any> {
  return maybe && maybe[IS_PATTERN];
}

type Pat<P> = RoutePattern<P>;

/**
 const r = num=>Array(num).fill(null).map((v,i)=>i);
 const res = r(10).map(count=> count === 0 ? (`function createPattern(): Pat<{}>;`) : (`function createPattern<${r(count).map(i=>`P${i} extends In`).join(', ')}>(${r(count).map(i=>`p${i}: P${i}`).join(', ')}): Pat<${r(count).map(i=>`Params<P${i}>`).join(' & ')}>;`)).map(v=>`// prettier-ignore\n${v}`).join('\n');

 */

// prettier-ignore
// prettier-ignore
function createPattern(): Pat<{}>;
// prettier-ignore
function createPattern<P0 extends In>(p0: P0): Pat<Params<P0>>;
// prettier-ignore
function createPattern<P0 extends In, P1 extends In>(p0: P0, p1: P1): Pat<Params<P0> & Params<P1>>;
// prettier-ignore
function createPattern<P0 extends In, P1 extends In, P2 extends In>(p0: P0, p1: P1, p2: P2): Pat<Params<P0> & Params<P1> & Params<P2>>;
// prettier-ignore
function createPattern<P0 extends In, P1 extends In, P2 extends In, P3 extends In>(p0: P0, p1: P1, p2: P2, p3: P3): Pat<Params<P0> & Params<P1> & Params<P2> & Params<P3>>;
// prettier-ignore
function createPattern<P0 extends In, P1 extends In, P2 extends In, P3 extends In, P4 extends In>(p0: P0, p1: P1, p2: P2, p3: P3, p4: P4): Pat<Params<P0> & Params<P1> & Params<P2> & Params<P3> & Params<P4>>;
// prettier-ignore
function createPattern<P0 extends In, P1 extends In, P2 extends In, P3 extends In, P4 extends In, P5 extends In>(p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5): Pat<Params<P0> & Params<P1> & Params<P2> & Params<P3> & Params<P4> & Params<P5>>;
// prettier-ignore
function createPattern<P0 extends In, P1 extends In, P2 extends In, P3 extends In, P4 extends In, P5 extends In, P6 extends In>(p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6): Pat<Params<P0> & Params<P1> & Params<P2> & Params<P3> & Params<P4> & Params<P5> & Params<P6>>;
// prettier-ignore
function createPattern<P0 extends In, P1 extends In, P2 extends In, P3 extends In, P4 extends In, P5 extends In, P6 extends In, P7 extends In>(p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7): Pat<Params<P0> & Params<P1> & Params<P2> & Params<P3> & Params<P4> & Params<P5> & Params<P6> & Params<P7>>;
// prettier-ignore
function createPattern<P0 extends In, P1 extends In, P2 extends In, P3 extends In, P4 extends In, P5 extends In, P6 extends In, P7 extends In, P8 extends In>(p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8): Pat<Params<P0> & Params<P1> & Params<P2> & Params<P3> & Params<P4> & Params<P5> & Params<P6> & Params<P7> & Params<P8>>;

function createPattern(...parts: Array<In>): RoutePattern<any>;
function createPattern(...parts: Array<In>): RoutePattern<any> {
  const ctx = Context.create(serializeParts(parts));
  return {
    parts,
    [IS_PATTERN]: ctx.Provider,
    Consumer: ctx.Consumer,
  };
}

function number<N extends string>(name: N): PartObject<N, number> {
  return {
    name,
    validate: (value, ...rest) => {
      const parsed = parseFloat(value);
      if (Number.isNaN(parsed)) {
        return { match: false };
      }
      return { match: true, value: parsed, next: rest };
    },
  };
}

function string<N extends string>(name: N): PartObject<N, string> {
  return {
    name,
    validate: (value, ...rest) => {
      if (typeof value === 'string') {
        return { match: true, value: value, next: rest };
      }
      return { match: false };
    },
  };
}

function constant<N extends string>(name: N): PartObject<N, never> {
  return {
    name,
    validate: (value, ...rest) => {
      if (name === value) {
        return { match: true, value: null as never, next: rest };
      }
      return { match: false };
    },
  };
}

type OptionalValue<T> = { present: false } | { present: true; value: T };

function optional<N extends string, T extends any>(sub: PartObject<N, T>): PartObject<N, OptionalValue<T>> {
  return {
    name: sub.name,
    validate: (...all) => {
      const subMatch = sub.validate(...all);
      if (subMatch.match) {
        return { match: true, value: { present: true, value: subMatch.value }, next: subMatch.next };
      }
      return { match: true, value: { present: false }, next: all };
    },
  };
}

function optionalConst<N extends string>(name: N, constant: string = name): PartObject<N, boolean> {
  return {
    name,
    validate: (value, ...rest) => {
      if (value === constant) {
        return { match: true, value: true, next: rest };
      }
      return { match: true, value: false, next: [value, ...rest] };
    },
  };
}

function multiple<N extends string, T extends any>(
  sub: PartObject<N, T>,
  atLeastOne: boolean = false
): PartObject<N, Array<T>> {
  return {
    name: sub.name,
    validate: (...all) => {
      const values: Array<T> = [];
      let next = all;
      let nextMatch: ValidateResult<T>;
      do {
        nextMatch = sub.validate(...next);
        if (nextMatch.match) {
          next = nextMatch.next;
          values.push(nextMatch.value);
        }
      } while (nextMatch.match === true);
      if (values.length === 0 && atLeastOne === true) {
        return { match: false };
      }
      return { match: true, value: values, next };
    },
  };
}

function parsePattern<Params extends { [key: string]: string } = { [key: string]: string }>(
  str: string
): RoutePattern<Params> {
  const strParts = splitPathname(str);
  const parts: Array<Part> = strParts.map(strPart => {
    if (strPart[0] === ':') {
      return string(strPart.slice(1));
    }
    return strPart;
  });
  return createPattern(...parts) as any;
}

export interface MatchResult<Params> {
  providers: Array<ContextProvider<any, false>>;
  params: Params;
  next: Array<string>;
}

function matchPart(part: Part, pathname: Array<string>): MatchResult<any> | false {
  if (typeof part === 'string') {
    if (part === pathname[0]) {
      return { providers: [], params: {}, next: pathname.slice(1) };
    }
    return false;
  }
  if (isPattern(part)) {
    const match = matchNextParts(part.parts, pathname);
    if (match === false) {
      return false;
    }
    return {
      next: match.next,
      params: match.params,
      providers: [...match.providers, part[IS_PATTERN](match.params)],
    };
  }
  const res = part.validate(...pathname);
  if (res.match === false) {
    return false;
  }
  return {
    providers: [],
    params: {
      [part.name]: res.value,
    },
    next: res.next,
  };
}

function matchNextParts(parts: Array<Part>, pathname: Array<string>): MatchResult<any> | false {
  if (parts.length === 0) {
    return { providers: [], params: {}, next: pathname };
  }
  const res = matchPart(parts[0], pathname);
  if (res === false) {
    return false;
  }
  const nextRes = matchNextParts(parts.slice(1), res.next);
  if (nextRes === false) {
    return false;
  }
  return {
    next: nextRes.next,
    params: {
      ...res.params,
      ...nextRes.params,
    },
    providers: [...res.providers, ...nextRes.providers],
  };
}

function matchPattern<Params>(pattern: RoutePattern<Params>, pathname: Array<string>): MatchResult<Params> | false {
  return matchPart(pattern, pathname);
}

function serializeParts(parts: Array<In>): string {
  return (
    '/' +
    parts
      .map((part): string => {
        if (typeof part === 'string') {
          return part;
        }
        if (isPattern(part)) {
          return serializeParts(part.parts);
        }
        return ':' + part.name;
      })
      .join('/')
  );
}

function splitPathname(pathname: string): Array<string> {
  const strParts = pathname.split('/');
  if (strParts[0] === '') {
    strParts.shift();
  }
  if (strParts[strParts.length - 1] === '') {
    strParts.pop();
  }
  return strParts;
}

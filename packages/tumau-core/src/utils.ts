export function notNill<T>(maybe: T | undefined | null): T {
  if (maybe === null || maybe === undefined) {
    throw Error(`Unexpected nill`);
  }
  return maybe;
}

export function isStream(maybe: any): maybe is WritableStream | ReadableStream {
  return maybe !== null && typeof maybe === 'object' && typeof maybe.pipe === 'function';
}

export function isWritableStream(maybe: any): maybe is WritableStream {
  return isStream(maybe) && (maybe as any).writable !== false;
}

import { Writable, Readable } from 'stream';

export function notNill<T>(maybe: T | undefined | null): T {
  if (maybe === null || maybe === undefined) {
    throw Error(`Unexpected nill`);
  }
  return maybe;
}

export function isStream(maybe: unknown): maybe is Writable | Readable {
  return maybe !== null && typeof maybe === 'object' && typeof (maybe as any).pipe === 'function';
}

export function isWritableStream(maybe: unknown): maybe is Writable {
  return isStream(maybe) && (maybe as any).writable !== false;
}

export function notNill<T>(maybe: T | undefined | null): T {
  if (maybe === null || maybe === undefined) {
    throw Error(`Unexpected nill`);
  }
  return maybe;
}

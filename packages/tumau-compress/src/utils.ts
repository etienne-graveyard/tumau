export function toArray<T>(val: T | Array<T>): Array<T> {
  return Array.isArray(val) ? val : [val];
}

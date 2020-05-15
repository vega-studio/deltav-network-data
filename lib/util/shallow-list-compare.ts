/**
 * Shallow compare elements between two lists.
 */
export function shallowListCompare<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;

  for (let i = 0, iMax = a.length; i < iMax; ++i) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

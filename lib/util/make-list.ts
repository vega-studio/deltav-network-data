/**
 * Makes a simpler way to copy a single or list of items to a new array.
 * This can also flatten a list of lists to a list.
 */
export function makeList<T>(items: T | T[] | T[][] | Set<T>): T[] {
  if (items instanceof Set) {
    const list: T[] = [];
    items.forEach((v) => list.push(v));
    return list;
  }

  return Array.isArray(items)
    ? Array.isArray(items[0])
      ? (items as T[][]).reduce((p, n) => p.concat(n), [])
      : (items as T[]).slice(0)
    : [items];
}

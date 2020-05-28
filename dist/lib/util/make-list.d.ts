/**
 * Makes a simpler way to copy a single or list of items to a new array.
 * This can also flatten a list of lists to a list.
 */
export declare function makeList<T>(items: T | T[] | T[][] | Set<T>): T[];

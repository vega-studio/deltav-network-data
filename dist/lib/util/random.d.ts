declare type Rand = (range: number) => number;
/** Get a random item from a list */
export declare function randItem<T>(rand: Rand, list: T[]): T;
/**
 * This produces a list of randomized numbers (length of 'count') that will sum together to be the 'total'.
 */
export declare function randomSum(rand: Rand, total: number, count: number): number[];
/**
 * Get two random items from a list that are both different. Returns null when not enough items available. This works
 * for Objects (Object, Function) NOT traditional primitives (string, number)
 */
export declare function exclusiveRandItems<T>(rand: Rand, list: T[], count: number): T[] | null;
export {};

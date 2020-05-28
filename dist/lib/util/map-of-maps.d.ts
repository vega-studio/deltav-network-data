/**
 * This is a helper to add a value to a map of maps.
 */
export declare function addToMapOfMaps<T, U, V>(map: Map<T, Map<U, V>>, firstKey: T, secondKey: U, value: V): void;
/**
 * This is a helper to remove a value from a map of maps
 */
export declare function removeFromMapOfMaps<T, U, V>(map: Map<T, Map<U, V>>, firstKey: T, secondKey: U): boolean;
/**
 * This is a helper to get a value from a map of maps
 */
export declare function getFromMapOfMaps<T, U, V>(map: Map<T, Map<U, V>>, firstKey: T, secondKey: U): V | undefined;

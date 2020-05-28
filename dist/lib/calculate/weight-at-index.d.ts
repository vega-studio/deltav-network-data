import { Weights } from "../types";
/**
 * This is a normalizing method for accessing a weight at a provided index. If
 * the Weights does not have a value at that index, this returns 0.
 *
 * If the Weights is a single number and not a list, this assumes the weight
 * at any index is the number. If you want to avoid this behavior, then you
 * should make the weight for the node a list of a single number:
 * [0] instead of 0
 */
export declare function weightAtIndex(index: number, weights: Weights): number;

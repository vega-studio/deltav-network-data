import { Weights } from "../types";

/**
 * Provides the largest weight from a weights value.
 */
export function maxWeight(val: Weights) {
  if (Array.isArray(val)) return Math.max(...val);
  return val;
}

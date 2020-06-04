import { Weights } from "../types";

/**
 * Provides the largest weight from a weights value.
 */
export function maxWeight(val: Weights) {
  if (Array.isArray(val)) {
    if (val.length === 0) return 0;
    return Math.max(...val);
  }

  return val;
}

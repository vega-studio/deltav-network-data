import { Weights } from "../types";

/**
 * Gets the smallest Weight in a given weight measurement
 */
export function minWeight(val: Weights) {
  if (Array.isArray(val)) return Math.min(...val);
  return val;
}

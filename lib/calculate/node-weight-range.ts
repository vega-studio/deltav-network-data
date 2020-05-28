import { AnalyzeNetwork } from "../types";
import { maxWeight } from "./max-weight";
import { minWeight } from "./min-weight";
import { weightAtIndex } from "./weight-at-index";

/**
 * This calculates the range of the weights on the nodes in a given data network
 *
 * @param network The network data who's nodes we want to examine
 * @param weightIndex If this is provided, this will do the weight comparison
 *                    at the given index in the list of weights for the node.
 *                    If not provided, this will look across ALL weights in
 *                    every node to find the min and max.
 */
export function nodeWeightRange<TNodeMeta, TEdgeMeta>(
  network: AnalyzeNetwork<TNodeMeta, TEdgeMeta>,
  weightIndex?: number
): [number, number] {
  let nodeMin = Number.MAX_SAFE_INTEGER;
  let nodeMax = Number.MIN_SAFE_INTEGER;

  if (weightIndex === void 0) {
    for (let i = 0, iMax = network.nodes.length; i < iMax; ++i) {
      const node = network.nodes[i];
      nodeMin = Math.min(nodeMin, minWeight(node.value));
      nodeMax = Math.max(nodeMax, maxWeight(node.value));
    }
  } else {
    for (let i = 0, iMax = network.nodes.length; i < iMax; ++i) {
      const node = network.nodes[i];
      nodeMin = Math.min(nodeMin, weightAtIndex(weightIndex, node.value));
      nodeMax = Math.max(nodeMax, weightAtIndex(weightIndex, node.value));
    }
  }

  return [nodeMin, nodeMax];
}

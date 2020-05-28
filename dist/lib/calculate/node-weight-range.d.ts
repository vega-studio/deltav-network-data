import { AnalyzeNetwork } from "../types";
/**
 * This calculates the range of the weights on the nodes in a given data network
 *
 * @param network The network data who's nodes we want to examine
 * @param weightIndex If this is provided, this will do the weight comparison
 *                    at the given index in the list of weights for the node.
 *                    If not provided, this will look across ALL weights in
 *                    every node to find the min and max.
 */
export declare function nodeWeightRange<TNodeMeta, TEdgeMeta>(network: AnalyzeNetwork<TNodeMeta, TEdgeMeta>, weightIndex?: number): [number, number];

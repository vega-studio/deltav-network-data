import { IdentifiableById } from "deltav";
import { AnalyzeEdge, AnalyzeNetwork, AnalyzeNode, Weights } from "../types";
/**
 * This compares two lists of items that have an ID property
 */
export declare function compareIdentifiers(a: IdentifiableById[], b: IdentifiableById[]): boolean;
/**
 * This compares two weight values with each other
 */
export declare function compareWeights(weightA: Weights, weightB: Weights): boolean;
/**
 * This compares two nodes to see if they have the same properties. Edge references are compared by id.
 */
export declare function compareNodes<TNodeMeta, TEdgeMeta>(nodeA: AnalyzeNode<TNodeMeta, TEdgeMeta>, nodeB: AnalyzeNode<TNodeMeta, TEdgeMeta>): boolean;
/**
 * This compares two edges to see if they have the same properties. Node references are compared by id.
 */
export declare function compareEdges<TNodeMeta, TEdgeMeta>(edgeA: AnalyzeEdge<TNodeMeta, TEdgeMeta>, edgeB: AnalyzeEdge<TNodeMeta, TEdgeMeta>): boolean;
/**
 * This compares two networks equivalence.
 */
export declare function compareNetworks<TNodeMeta, TEdgeMeta>(networkA: AnalyzeNetwork<TNodeMeta, TEdgeMeta>, networkB: AnalyzeNetwork<TNodeMeta, TEdgeMeta>): boolean;

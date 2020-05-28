import { IdentifiableById } from "deltav";
import { IEdge, INetworkData, INode, Weights } from "../types";
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
export declare function compareNodes<TNodeMeta, TEdgeMeta>(nodeA: INode<TNodeMeta, TEdgeMeta>, nodeB: INode<TNodeMeta, TEdgeMeta>): boolean;
/**
 * This compares two edges to see if they have the same properties. Node references are compared by id.
 */
export declare function compareEdges<TNodeMeta, TEdgeMeta>(edgeA: IEdge<TNodeMeta, TEdgeMeta>, edgeB: IEdge<TNodeMeta, TEdgeMeta>): boolean;
/**
 * This compares two networks equivalence.
 */
export declare function compareNetworks<TNodeMeta, TEdgeMeta>(networkA: INetworkData<TNodeMeta, TEdgeMeta>, networkB: INetworkData<TNodeMeta, TEdgeMeta>): boolean;

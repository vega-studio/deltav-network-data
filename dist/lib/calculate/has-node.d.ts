import { AnalyzeNetwork, AnalyzeNodes, INode } from "../types";
/**
 * This method checks to see if one or more nodes are within the specified network. If any node in the list is not
 * in the network, this returns false. This performs the examination by node id.
 */
export declare function hasNode<TNodeMeta, TEdgeMeta>(network: AnalyzeNetwork<TNodeMeta, TEdgeMeta>, nodes: AnalyzeNodes<TNodeMeta, TEdgeMeta> | INode<TNodeMeta, TEdgeMeta>[]): boolean;

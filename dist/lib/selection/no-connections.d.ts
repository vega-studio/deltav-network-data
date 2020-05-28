import { AnalyzeNetwork } from "../types";
/**
 * Produces all nodes that are not connected to anything
 */
export declare function noConnections<TNodeMeta, TEdgeMeta>(network: AnalyzeNetwork<TNodeMeta, TEdgeMeta>): import("../types").INode<TNodeMeta, TEdgeMeta>[];

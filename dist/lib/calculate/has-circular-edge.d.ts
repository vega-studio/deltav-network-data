import { AnalyzeNode } from "../types";
/**
 * Examines a node and determines if it has a circular edge reference to itself
 * or not.
 */
export declare function hasCircularEdge<TNodeMeta, TEdgeMeta>(node: AnalyzeNode<TNodeMeta, TEdgeMeta>): boolean;

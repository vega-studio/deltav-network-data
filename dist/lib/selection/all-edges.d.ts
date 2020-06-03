import { AnalyzeNode, IEdge, INode } from "../types";
/**
 * Retrieves the set of edges from all nodes specified
 */
export declare function allEdges<TNodeMeta, TEdgeMeta>(node: AnalyzeNode<TNodeMeta, TEdgeMeta> | INode<TNodeMeta, TEdgeMeta>[], out?: Set<IEdge<TNodeMeta, TEdgeMeta>>): Set<IEdge<TNodeMeta, TEdgeMeta>>;

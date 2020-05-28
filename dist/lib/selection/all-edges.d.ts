import { IEdge, INode } from "../types";
/**
 * Retrieves the set of edges from all nodes specified
 */
export declare function allEdges<TNodeMeta, TEdgeMeta>(node: INode<TNodeMeta, TEdgeMeta> | INode<TNodeMeta, TEdgeMeta>[]): Set<IEdge<TNodeMeta, TEdgeMeta>>;

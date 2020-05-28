import { IEdge, ProcessEdge, ProcessEdges, ProcessNetwork } from "../types";
/**
 * The results of the remove operation.
 */
export interface IRemoveEdgeResult<TNodeMeta, TEdgeMeta> {
    /** The edges successfully remvoed */
    edges: Set<IEdge<TNodeMeta, TEdgeMeta>>;
    /** The edges that could not be removed */
    errors: Set<IEdge<TNodeMeta, TEdgeMeta>> | null;
}
/**
 * This removes an edge from it's network data structure.
 *
 * Specify removedEdges to prevent errors from being created across multiple edge removals.
 */
export declare function removeEdge<TNodeMeta, TEdgeMeta>(network: ProcessNetwork<TNodeMeta, TEdgeMeta>, edges: ProcessEdges<TNodeMeta, TEdgeMeta>, removedEdges?: Set<ProcessEdge<TNodeMeta, TEdgeMeta>>): {
    edges: Set<ProcessEdge<TNodeMeta, TEdgeMeta>>;
    errors: Set<IEdge<TNodeMeta, TEdgeMeta>> | null;
};

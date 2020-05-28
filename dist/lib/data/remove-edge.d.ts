import { IEdge, INetworkData } from "../types";
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
export declare function removeEdge<TNodeMeta, TEdgeMeta>(network: INetworkData<TNodeMeta, TEdgeMeta>, edges: IEdge<TNodeMeta, TEdgeMeta> | IEdge<TNodeMeta, TEdgeMeta>[], removedEdges?: Set<IEdge<TNodeMeta, TEdgeMeta>>): {
    edges: Set<IEdge<TNodeMeta, TEdgeMeta>>;
    errors: Set<IEdge<TNodeMeta, TEdgeMeta>> | null;
};

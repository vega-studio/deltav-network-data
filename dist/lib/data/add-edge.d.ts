import { IEdge, ProcessEdge, ProcessEdges, ProcessNetwork } from "../types";
/**
 * This contains the information to see which edges were successfully added to
 * the network
 */
export interface IAddEdgeResult<TNodeMeta, TEdgeMeta> {
    /** Successfully added edges */
    edges: Set<IEdge<TNodeMeta, TEdgeMeta>>;
    /** Edges that could not be added due to errors */
    errors: Set<IEdge<TNodeMeta, TEdgeMeta>> | null;
}
/**
 * Adds an edge to the network and ensures it updates the associated nodes and
 * lookups. The ends of the edge MUST
 * be within the network at the time of executing this method.
 *
 * Provide addedEdges to this method to prevent errors from being reported when
 * multiple similar operations are
 * executed.
 *
 * @param network The network data to add the edges into
 * @param edges The edge or list of edges to add into the network
 * @param addedEdges A list of edges that have already been added. This is a
 *                   context used during add operations to prevent infinite
 *                   loops and ensure an edge is only added once.
 * @param edgeErrors Provides an output set to merge errors for edges into
 */
export declare function addEdge<TNodeMeta, TEdgeMeta>(network: ProcessNetwork<TNodeMeta, TEdgeMeta>, edges: ProcessEdges<TNodeMeta, TEdgeMeta>, addedEdges?: Set<ProcessEdge<TNodeMeta, TEdgeMeta>>, edgeErrors?: Set<ProcessEdge<TNodeMeta, TEdgeMeta>>): IAddEdgeResult<TNodeMeta, TEdgeMeta>;

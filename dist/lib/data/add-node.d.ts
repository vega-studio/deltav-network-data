import { IEdge, INode, ProcessEdge, ProcessNetwork, ProcessNode, ProcessNodes } from "../types";
/**
 * This contains the information to see which nodes were successfully added to the network as well as new edges
 */
export interface IAddNodeResult<TNodeMeta, TEdgeMeta> {
    /** Successfully added nodes */
    nodes: Set<INode<TNodeMeta, TEdgeMeta>>;
    /** Successfully added edges */
    edges: Set<IEdge<TNodeMeta, TEdgeMeta>>;
    /** Nodes that had errors while adding */
    errors: {
        nodes: Set<INode<TNodeMeta, TEdgeMeta>> | null;
        edges: Set<IEdge<TNodeMeta, TEdgeMeta>> | null;
    };
}
/**
 * Adds a node into a network. This WILL add any edges associated with the node if both ends of the edge are in the
 * network, or is being added into the network during this operation.
 * This ensures all edges and lookups are updated properly.
 *
 * @param network The network data to add the nodes into
 * @param nodes The node or list of nodes to add into the network
 * @param addedNodes A list of nodes that have already been added. This is a context used during add operations to
 *                   prevent infinite loops and ensure a node is only added once.
 * @param addedEdges A list of edges that have already been added. This is a context used during add operations to
 *                   prevent infinite loops and ensure an edge is only added once.
 */
export declare function addNode<TNodeMeta, TEdgeMeta>(network: ProcessNetwork<TNodeMeta, TEdgeMeta>, nodes: ProcessNodes<TNodeMeta, TEdgeMeta>, addedNodes?: Set<ProcessNode<TNodeMeta, TEdgeMeta>>, addedEdges?: Set<ProcessEdge<TNodeMeta, TEdgeMeta>>): IAddNodeResult<TNodeMeta, TEdgeMeta>;

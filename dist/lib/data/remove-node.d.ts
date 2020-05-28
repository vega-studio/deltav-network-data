import { IEdge, INetworkData, INode } from "../types";
/**
 * This contains the information to see which nodes were successfully removed
 * from the network as well as edges
 */
export interface IRemoveNodeResult<TNodeMeta, TEdgeMeta> {
    /** List of nodes removed during the operation */
    nodes: Set<INode<TNodeMeta, TEdgeMeta>>;
    /** List of edges removed during the operation */
    edges: Set<IEdge<TNodeMeta, TEdgeMeta>>;
    /** List of nodes that could not be removed during the operation */
    errors: Set<INode<TNodeMeta, TEdgeMeta>> | null;
}
/**
 * Removes a node from a network and cleans out the edges linking the node to
 * other nodes.
 */
export declare function removeNode<TNodeMeta, TEdgeMeta>(network: INetworkData<TNodeMeta, TEdgeMeta>, nodes: INode<TNodeMeta, TEdgeMeta> | INode<TNodeMeta, TEdgeMeta>[], removedNodes?: Set<INode<TNodeMeta, TEdgeMeta>>, removedEdges?: Set<IEdge<TNodeMeta, TEdgeMeta>>): {
    nodes: Set<INode<TNodeMeta, TEdgeMeta>>;
    edges: Set<IEdge<TNodeMeta, TEdgeMeta>>;
    errors: Set<INode<TNodeMeta, TEdgeMeta>> | null;
};

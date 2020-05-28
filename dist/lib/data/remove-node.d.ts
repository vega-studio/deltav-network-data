import { INode, ProcessEdge, ProcessNetwork, ProcessNode, ProcessNodes } from "../types";
/**
 * This contains the information to see which nodes were successfully removed
 * from the network as well as edges
 */
export interface IRemoveNodeResult<TNodeMeta, TEdgeMeta> {
    /** List of nodes removed during the operation */
    nodes: Set<ProcessNode<TNodeMeta, TEdgeMeta>>;
    /** List of edges removed during the operation */
    edges: Set<ProcessEdge<TNodeMeta, TEdgeMeta>>;
    /** List of nodes that could not be removed during the operation */
    errors: Set<ProcessNode<TNodeMeta, TEdgeMeta>> | null;
}
/**
 * Removes a node from a network and cleans out the edges linking the node to
 * other nodes.
 */
export declare function removeNode<TNodeMeta, TEdgeMeta>(network: ProcessNetwork<TNodeMeta, TEdgeMeta>, nodes: ProcessNodes<TNodeMeta, TEdgeMeta>, removedNodes?: Set<ProcessNode<TNodeMeta, TEdgeMeta>>, removedEdges?: Set<ProcessEdge<TNodeMeta, TEdgeMeta>>): {
    nodes: Set<ProcessNode<TNodeMeta, TEdgeMeta>>;
    edges: Set<ProcessEdge<TNodeMeta, TEdgeMeta>>;
    errors: Set<INode<TNodeMeta, TEdgeMeta>> | null;
};

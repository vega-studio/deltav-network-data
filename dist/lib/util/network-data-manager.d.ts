import { addEdge } from "../data/add-edge";
import { addNode } from "../data/add-node";
import { removeEdge } from "../data/remove-edge";
import { removeNode } from "../data/remove-node";
import { IEdge, IManagedNetworkData, INode, ProcessNetwork } from "../types";
/**
 * A listener that can respond to mutations the manager has queued.
 */
export interface INetworkDataManagerListener<TNodeMeta, TEdgeMeta> {
    /** Add edges callback */
    onAddEdges?(edges: Set<IEdge<TNodeMeta, TEdgeMeta>>): void;
    /** Add nodes callback */
    onAddNodes?(nodes: Set<INode<TNodeMeta, TEdgeMeta>>): void;
    /** Operation errors for edges */
    onEdgeErrors?(edges: Set<IEdge<TNodeMeta, TEdgeMeta>>): void;
    /** Operation errors for nodes */
    onNodeErrors?(nodes: Set<INode<TNodeMeta, TEdgeMeta>>): void;
    /** Remove edges callback */
    onRemoveEdges?(edges: Set<IEdge<TNodeMeta, TEdgeMeta>>): void;
    /** Remove nodes callback */
    onRemoveNodes?(nodes: Set<INode<TNodeMeta, TEdgeMeta>>): void;
}
export interface INetworkDataManager<TNodeMeta, TEdgeMeta> {
    /**
     * The data object to monitor by this manager.
     *
     * NOTE: only operations carried out by this manager will produce valid
     * events. Mutating the network data without the manager can not be monitored.
     */
    data: ProcessNetwork<TNodeMeta, TEdgeMeta>;
    /**
     * If this is provided, the results will only propogate out after a small
     * delay so that way numerous operations can happen before event broadcasts
     * occur. If this is not provided, then each change will be broadcasted
     * immediately.
     *
     * Another side effect of including the debounce: if a node or edge is added
     * and removed several times, the result will only specify the add or remove
     * once, if that truly changes the state of the network. For example: if a
     * node is in the network, then removed, then added back again, there will be
     * no broadcast event for the node itself.
     */
    debounce?: number;
    /** A listener to apply to the manager immediately */
    listener?: INetworkDataManagerListener<TNodeMeta, TEdgeMeta>;
}
/**
 * This is a helper manager that provides an event system for handling mutations
 * to your network data object. Essentially, instead of calling data operations
 * on your network directly, use this manager's methods so you can get feedback
 * on the operations that take place via callback.
 */
export declare class NetworkDataManager<TNodeMeta, TEdgeMeta> {
    private options;
    private nodeAdds;
    private nodeRemovals;
    private nodeErrors;
    private edgeAdds;
    private edgeRemovals;
    private edgeErrors;
    private timerId;
    private listeners;
    /**
     * This promise is resolved when all changes have been broadcasted. This is
     * only not resolved when a debounce is specified, otherwise, after each
     * mutation the manager finishes immediately.
     */
    finished: Promise<void>;
    /** This is the resolver function to make the finished promise resolve. */
    private resolve?;
    constructor(options: INetworkDataManager<TNodeMeta, TEdgeMeta>);
    /**
     * Get the data this manager manages, but only offer a readonly look into it.
     */
    get data(): IManagedNetworkData<TNodeMeta, TEdgeMeta>;
    /**
     * Adds a listener that will begin to monitor changes to the network data.
     */
    addListener(listener: INetworkDataManagerListener<TNodeMeta, TEdgeMeta>): void;
    /**
     * Removes a listener from this manager so it will no longer receive events.
     */
    removeListener(listener: INetworkDataManagerListener<TNodeMeta, TEdgeMeta>): void;
    /**
     * Add a node or several nodes to the network. The node can have edges
     * established within the node which will be validated for injection into the
     * network.
     */
    addNode(node: INode<TNodeMeta, TEdgeMeta> | INode<TNodeMeta, TEdgeMeta>[]): ReturnType<typeof addNode>;
    /**
     * Add an edge to the network. The network MUST contain the nodes the edge
     * specifies or it will be considered an error. Thus, always you ensure you
     * follow the rule:
     *
     * Always add nodes before you add edges.
     */
    addEdge(edge: IEdge<TNodeMeta, TEdgeMeta>): ReturnType<typeof addEdge>;
    /**
     * Removes a node from the network. This also causes all edges to the
     * specified node to be removed as well.
     */
    removeNode(node: INode<TNodeMeta, TEdgeMeta> | INode<TNodeMeta, TEdgeMeta>[]): ReturnType<typeof removeNode>;
    /**
     * Removes an edge from the network. This will clear the edge from it's
     * associated nodes.
     */
    removeEdge(edge: IEdge<TNodeMeta, TEdgeMeta> | IEdge<TNodeMeta, TEdgeMeta>[]): ReturnType<typeof removeEdge>;
    /**
     * Properly registers a node add and eliminates any add operation that results
     * in the network containing the same node after a batch of network
     * mutations.
     */
    private doAddNode;
    /**
     * Properly registers an edge add and eliminates any add operation that
     * results in the network containing the same edge after a batch of network
     * mutations.
     */
    private doAddEdge;
    /**
     * Properly registers a node removal and eliminates any removal operation that
     * results in the network NOT containing the node after a batch of network
     * mutations.
     */
    private doRemoveNode;
    /**
     * Properly registers an edge removal and eliminates any removal operation that
     * results in the network containing the same edge after a batch of network
     * mutations.
     */
    private doRemoveEdge;
    /**
     * This flushes out all changes aggregated by this manager and broadcasts the
     * changes to the event handlers.
     */
    flush(force?: boolean): void;
}

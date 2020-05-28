import { addEdge } from "../data/add-edge";
import { addNode } from "../data/add-node";
import { removeEdge } from "../data/remove-edge";
import { removeNode } from "../data/remove-node";
import { IEdge, IManagedNetworkData, INode, ProcessNetwork } from "../types";

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

/**
 * This is a helper manager that provides an event system for handling mutations
 * to your network data object. Essentially, instead of calling data operations
 * on your network directly, use this manager's methods so you can get feedback
 * on the operations that take place via callback.
 */
export class NetworkDataManager<TNodeMeta, TEdgeMeta> {
  private options: INetworkDataManager<TNodeMeta, TEdgeMeta>;
  private nodeAdds = new Set<INode<TNodeMeta, TEdgeMeta>>();
  private nodeRemovals = new Set<INode<TNodeMeta, TEdgeMeta>>();
  private nodeErrors = new Set<INode<TNodeMeta, TEdgeMeta>>();
  private edgeAdds = new Set<IEdge<TNodeMeta, TEdgeMeta>>();
  private edgeRemovals = new Set<IEdge<TNodeMeta, TEdgeMeta>>();
  private edgeErrors = new Set<IEdge<TNodeMeta, TEdgeMeta>>();
  private timerId: NodeJS.Timeout;

  /**
   * This promise is resolved when all changes have been broadcasted. This is
   * only not resolved when a debounce is specified, otherwise, after each
   * mutation the manager finishes immediately.
   */
  finished = Promise.resolve();
  /** This is the resolver function to make the finished promise resolve. */
  private resolve?: Function;

  constructor(options: INetworkDataManager<TNodeMeta, TEdgeMeta>) {
    this.options = options;
  }

  /**
   * Get the data this manager manages, but only offer a readonly look into it.
   */
  get data(): IManagedNetworkData<TNodeMeta, TEdgeMeta> {
    return this.options.data;
  }

  /**
   * Add a node or several nodes to the network. The node can have edges
   * established within the node which will be validated for injection into the
   * network.
   */
  addNode(
    node: INode<TNodeMeta, TEdgeMeta> | INode<TNodeMeta, TEdgeMeta>[]
  ): ReturnType<typeof addNode> {
    const { data } = this.options;

    // Modify the network object
    const result = addNode(data, node);

    // Take the results and populate the broadcast items that are needed
    result.nodes.forEach(this.doAddNode);
    result.edges.forEach(this.doAddEdge);
    result.errors.nodes?.forEach((n) => this.nodeErrors.add(n));
    result.errors.edges?.forEach((e) => this.edgeErrors.add(e));

    // Broadcast the results. The flush operation accounts for debouncing
    this.flush();

    return result;
  }

  /**
   * Add an edge to the network. The network MUST contain the nodes the edge
   * specifies or it will be considered an error. Thus, always you ensure you
   * follow the rule:
   *
   * Always add nodes before you add edges.
   */
  addEdge(edge: IEdge<TNodeMeta, TEdgeMeta>): ReturnType<typeof addEdge> {
    const { data } = this.options;

    // Modify the network object
    const result = addEdge(data, edge);

    // Take the results and populate the broadcast items that are needed
    result.edges.forEach(this.doAddEdge);
    result.errors?.forEach((e) => this.edgeErrors.add(e));

    // Broadcast the results. The flush operation accounts for debouncing
    this.flush();

    return result;
  }

  /**
   * Removes a node from the network. This also causes all edges to the
   * specified node to be removed as well.
   */
  removeNode(
    node: INode<TNodeMeta, TEdgeMeta> | INode<TNodeMeta, TEdgeMeta>[]
  ): ReturnType<typeof removeNode> {
    const { data } = this.options;

    // Modify the network object
    const result = removeNode(data, node);

    // Take the results and populate the broadcast items that are needed
    result.nodes.forEach(this.doRemoveNode);
    result.edges.forEach(this.doRemoveEdge);
    result.errors?.forEach((n) => this.nodeErrors.add(n));

    // Broadcast the results. The flush operation accounts for debouncing
    this.flush();

    return result;
  }

  /**
   * Removes an edge from the network. This will clear the edge from it's
   * associated nodes.
   */
  removeEdge(
    edge: IEdge<TNodeMeta, TEdgeMeta> | IEdge<TNodeMeta, TEdgeMeta>[]
  ): ReturnType<typeof removeEdge> {
    const { data } = this.options;

    // Modify the network object
    const result = removeEdge(data, edge);

    // Take the results and populate the broadcast items that are needed
    result.edges.forEach(this.doRemoveEdge);
    result.errors?.forEach((e) => this.edgeErrors.add(e));

    // Broadcast the results. The flush operation accounts for debouncing
    this.flush();

    return result;
  }

  /**
   * Properly registers a node add and eliminates any add operation that results
   * in the network containing the same node after a batch of network
   * mutations.
   */
  private doAddNode = (node: INode<TNodeMeta, TEdgeMeta>) => {
    // If the node has a removal logged, this implies the node once already
    // existed in the network, which means the node is just being re-added,
    // which means it's not really an add operation that needs to be broadcast
    if (this.nodeRemovals.has(node)) {
      this.nodeRemovals.delete(node);
    }

    // If no other operation for the node is logged, then this is a legitimate
    // node add operation.
    else {
      this.nodeAdds.add(node);
    }
  };

  /**
   * Properly registers an edge add and eliminates any add operation that
   * results in the network containing the same edge after a batch of network
   * mutations.
   */
  private doAddEdge = (edge: IEdge<TNodeMeta, TEdgeMeta>) => {
    // If the edge has a removal logged, this implies the edge once already
    // existed in the network, which means the edge is just being re-added,
    // which means it's not really an add operation that needs to be broadcast
    if (this.edgeRemovals.has(edge)) {
      this.edgeRemovals.delete(edge);
    }

    // If no other operation for the node is logged, then this is a legitimate
    // edge add operation.
    else {
      this.edgeAdds.add(edge);
    }
  };

  /**
   * Properly registers a node removal and eliminates any removal operation that
   * results in the network NOT containing the node after a batch of network
   * mutations.
   */
  private doRemoveNode = (node: INode<TNodeMeta, TEdgeMeta>) => {
    // If the node has an add logged, then removing this node indicates the node
    // just will not be added the network in the first place so it does not need
    // any event broadcast for it for this batch of operations.
    if (this.nodeAdds.has(node)) {
      this.nodeAdds.delete(node);
    }

    // If no other operation for the node is logged, then we simply add the
    // removal event to be broadcast.
    else {
      this.nodeRemovals.add(node);
    }
  };

  /**
   * Properly registers an edge removal and eliminates any removal operation that
   * results in the network containing the same edge after a batch of network
   * mutations.
   */
  private doRemoveEdge = (edge: IEdge<TNodeMeta, TEdgeMeta>) => {
    // If the edge has an add logged, then removing this edge indicates the edge
    // just will not be added the network in the first place so it does not need
    // any event broadcast for it for this batch of operations.
    if (this.edgeAdds.has(edge)) {
      this.edgeAdds.delete(edge);
    }

    // If no other operation for the edge is logged, then we simply add the
    // removal event to be broadcast.
    else {
      this.edgeRemovals.add(edge);
    }
  };

  /**
   * This flushes out all changes aggregated by this manager and broadcasts the
   * changes to the event handlers.
   */
  flush(force?: boolean) {
    const {
      debounce,
      onRemoveEdges,
      onRemoveNodes,
      onEdgeErrors,
      onNodeErrors,
      onAddEdges,
      onAddNodes,
    } = this.options;

    // When debounce is in effect, we make sure we don't broadcast unless the
    // debouncer resolves.
    if (debounce && !force) {
      if (!this.resolve) {
        this.finished = new Promise<void>((r) => (this.resolve = r));
      }

      clearTimeout(this.timerId);
      this.timerId = setTimeout(() => this.flush(true), debounce);
    } else {
      // Ensure the timer waiting to fire never does as we're fully flushed now
      clearTimeout(this.timerId);
      // Broadcast failed element operations
      if (this.edgeErrors.size > 0) onEdgeErrors?.(this.edgeErrors);
      this.edgeErrors.clear();
      if (this.nodeErrors.size > 0) onNodeErrors?.(this.nodeErrors);
      this.nodeErrors.clear();
      // Broadcast removals first so responders can first free up resources
      // before piling on more. These are broadcast in reverse order to the add
      // nodes first rule, so they can be destructed in an appropriate manner.
      // It is often required to break all links before an object can be cleanly
      // discarded.
      if (this.edgeRemovals.size > 0) onRemoveEdges?.(this.edgeRemovals);
      this.edgeRemovals.clear();
      if (this.nodeRemovals.size > 0) onRemoveNodes?.(this.nodeRemovals);
      this.nodeRemovals.clear();
      // Now broadcast the add events. Nodes must be added first then edges, so
      // we will broadcast in that appropriate order
      if (this.nodeAdds.size > 0) onAddNodes?.(this.nodeAdds);
      this.nodeAdds.clear();
      if (this.edgeAdds.size > 0) onAddEdges?.(this.edgeAdds);
      this.edgeAdds.clear();

      // Make sure the finished Promise gets resolved.
      if (this.resolve) {
        this.resolve();
        delete this.resolve;
      }
    }
  }
}

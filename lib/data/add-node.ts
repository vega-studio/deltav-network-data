import { IEdge, INetworkData, INode } from "../types";
import { makeList } from "../util/make-list";
import { addEdge } from "./add-edge";

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
export function addNode<TNodeMeta, TEdgeMeta>(
  network: INetworkData<TNodeMeta, TEdgeMeta>,
  nodes: INode<TNodeMeta, TEdgeMeta> | INode<TNodeMeta, TEdgeMeta>[],
  addedNodes?: Set<INode<TNodeMeta, TEdgeMeta>>,
  addedEdges?: Set<IEdge<TNodeMeta, TEdgeMeta>>
): IAddNodeResult<TNodeMeta, TEdgeMeta> {
  // Ensure we're working with a list
  nodes = makeList(nodes);
  // Ensure we have a set to record newly added nodes
  addedNodes = addedNodes || new Set();
  // Create a set to track newly added edges
  addedEdges = addedEdges || new Set();
  // Create a set to track errors found during the adding process.
  const errors: Set<INode<TNodeMeta, TEdgeMeta>> = new Set();
  // Create a set to track errors found during the add process for edges
  const edgeErrors: Set<IEdge<TNodeMeta, TEdgeMeta>> = new Set();
  // This is a list of nodes that should have their edges added in
  const needsEdges: INode<TNodeMeta, TEdgeMeta>[] = [];

  // Process all of the nodes to be added
  for (let i = 0, iMax = nodes.length; i < iMax; ++i) {
    const node = nodes[i];

    // If the node's id already exists, the node specified can not be re-added
    if (network.nodeMap.has(node.id)) {
      // If this was a node added from processing added edges then this is not an error
      if (!addedNodes.has(node)) {
        errors.add(node);
      }

      continue;
    }

    // Add the node to the network
    network.nodes.push(node);
    network.nodeMap.set(node.id, node);
    addedNodes.add(node);
    needsEdges.push(node);
  }

  // To make adding edges in more true to adding in our new nodes, we add in edges AFTER all new nodes are added
  // Otherwise, some edges would not get added if they were built upon the nodes that are being added now
  for (let i = 0, iMax = needsEdges.length; i < iMax; ++i) {
    const node = needsEdges[i];
    // Validate the edges directionality relative to this node
    // Examine the node's edges to establish all necessary links
    addEdge(network, node.out, addedEdges, edgeErrors);
    addEdge(network, node.in, addedEdges, edgeErrors);
  }

  return {
    nodes: addedNodes,
    edges: addedEdges,
    errors: {
      nodes: errors,
      edges: edgeErrors,
    },
  };
}

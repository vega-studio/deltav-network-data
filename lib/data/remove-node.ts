import {
  INode,
  ProcessEdge,
  ProcessNetwork,
  ProcessNode,
  ProcessNodes,
} from "../types";
import { makeList } from "../util/make-list";
import { removeEdge } from "./remove-edge";

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
export function removeNode<TNodeMeta, TEdgeMeta>(
  network: ProcessNetwork<TNodeMeta, TEdgeMeta>,
  nodes: ProcessNodes<TNodeMeta, TEdgeMeta>,
  removedNodes?: Set<ProcessNode<TNodeMeta, TEdgeMeta>>,
  removedEdges?: Set<ProcessEdge<TNodeMeta, TEdgeMeta>>
) {
  // Ensure this is a list
  nodes = makeList(nodes);
  // Track all edges removed so we don't perform extra removals unnecessarily
  removedEdges = removedEdges || new Set();
  // Track all nodes successfully removed
  removedNodes = removedNodes || new Set();
  // Track all nodes that could not be removed during the operation
  const errors = new Set<INode<TNodeMeta, TEdgeMeta>>();

  // Loop through all nodes to remove
  for (let k = 0, kMax = nodes.length; k < kMax; ++k) {
    // Get the node to process
    const node = nodes[k];
    // See if the id of the node is valid for deletion
    const toDelete = network.nodeMap.get(node.id);

    // If we deleted the node successfully, then we need to make sure the node
    // deleted actually is the SAME node object we want to delete. Otherwise,
    // that's an error where we deleted a node with the same ID, but is NOT an
    // object truly within the network.
    if (toDelete) {
      if (toDelete === node) {
        network.nodeMap.delete(node.id);
      } else {
        errors.add(node);
        continue;
      }
    }

    // If the node is not within the network dataset, we error based on a bad
    // node identifier specified.
    else {
      // If we couldn't delete the node because it wasn't in the network, we
      // check to see if it was already removed
      if (!removedNodes.has(node)) {
        // If it wasn't removed, this means this node just didn't exist at all
        // in this network, thus is an error
        errors.add(node);
      }

      continue;
    }

    // Clear out the outgoing edges from the node from the network
    const nodeOut = removeEdge(network, node.out, removedEdges);
    // Clear out the incoming edges to the node from the network
    const nodeIn = removeEdge(network, node.in, removedEdges);
    // Preserve the node's state. It gets modified from the removeEdge operation
    node.in = Array.from(nodeIn.edges).concat(Array.from(nodeIn.errors || []));
    node.out = Array.from(nodeOut.edges).concat(
      Array.from(nodeOut.errors || [])
    );
    // Clear out the node from the network
    network.nodes.splice(network.nodes.indexOf(node), 1);
    // Flag the node as removed
    removedNodes.add(node);
  }

  return {
    nodes: removedNodes,
    edges: removedEdges,
    errors: errors.size > 0 ? errors : null,
  };
}

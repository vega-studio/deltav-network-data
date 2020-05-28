import { IEdge, ProcessEdge, ProcessEdges, ProcessNetwork } from "../types";
import { makeList } from "../util/make-list";
import { removeFromMapOfMaps } from "../util/map-of-maps";

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
export function removeEdge<TNodeMeta, TEdgeMeta>(
  network: ProcessNetwork<TNodeMeta, TEdgeMeta>,
  edges: ProcessEdges<TNodeMeta, TEdgeMeta>,
  removedEdges?: Set<ProcessEdge<TNodeMeta, TEdgeMeta>>
) {
  // Ensure we are working with a list
  edges = makeList(edges);
  // Tracks edges we successfully removed
  removedEdges = removedEdges || new Set<IEdge<TNodeMeta, TEdgeMeta>>();
  // Tracks edges that could not be removed
  const errors = new Set<IEdge<TNodeMeta, TEdgeMeta>>();

  // Processes all edges to be removed
  for (let i = 0, iMax = edges.length; i < iMax; ++i) {
    // Get the next edge to process
    const edge = edges[i];
    // Get the object we wish to delete to make sure the object specified exists
    // within the network.
    const toDelete = network.edgeMap.get(edge.id);

    // If we deleted the edge successfully, then we need to make sure the edge
    // deleted actually is the SAME edge object we want to delete. Otherwise,
    // that's an error where we deleted a edge with the same ID, but is NOT an
    // object truly within the network.
    if (toDelete) {
      if (toDelete === edge) {
        network.edgeMap.delete(edge.id);
      } else {
        errors.add(edge);
        continue;
      }
    }

    // If the edge is not within the network dataset, we error based on a bad
    // edge identifier specified.
    else {
      // If we couldn't delete the edge because it wasn't in the network, we
      // check to see if it was already removed
      if (!removedEdges.has(edge)) {
        // If it wasn't removed, this means this edge just didn't exist at all
        // in this network, thus is an error
        errors.add(edge);
      }

      continue;
    }

    // Safely clean the edge out of it's associated nodes
    const aIndex = edge.a.out.indexOf(edge);
    const bIndex = edge.b.in.indexOf(edge);
    if (aIndex > -1) edge.a.out.splice(aIndex, 1);
    if (bIndex > -1) edge.b.in.splice(bIndex, 1);
    // Clean out the edge from the network's listing
    const edgeIndex = network.edges.indexOf(edge);
    if (edgeIndex > -1) network.edges.splice(edgeIndex, 1);
    // Clean out the atob mapping from the network
    removeFromMapOfMaps(network.atobMap, edge.a, edge.b);
    // Add the edge to our list of edges that's been removed
    removedEdges.add(edge);
  }

  return {
    edges: removedEdges,
    errors: errors.size > 0 ? errors : null,
  };
}

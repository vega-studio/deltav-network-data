import { IEdge, INetworkData } from "../types";
import { makeList } from "../util/make-list";
import { addToMapOfMaps } from "../util/map-of-maps";

/**
 * This contains the information to see which edges were successfully added to the network
 */
export interface IAddEdgeResult<TNodeMeta, TEdgeMeta> {
  /** Successfully added edges */
  edges: Set<IEdge<TNodeMeta, TEdgeMeta>>;
  /** Edges that could not be added due to errors */
  errors: Set<IEdge<TNodeMeta, TEdgeMeta>> | null;
}

/**
 * Adds an edge to the network and ensures it updates the associated nodes and lookups. The ends of the edge MUST
 * be within the network at the time of executing this method.
 *
 * Provide addedEdges to this method to prevent errors from being reported when multiple similar operations are
 * executed.
 *
 * @param network The network data to add the edges into
 * @param edges The edge or list of edges to add into the network
 * @param addedEdges A list of edges that have already been added. This is a context used during add operations to
 *                   prevent infinite loops and ensure an edge is only added once.
 * @param edgeErrors Provides an output set to merge errors for edges into
 */
export function addEdge<TNodeMeta, TEdgeMeta>(
  network: INetworkData<TNodeMeta, TEdgeMeta>,
  edges: IEdge<TNodeMeta, TEdgeMeta> | IEdge<TNodeMeta, TEdgeMeta>[],
  addedEdges?: Set<IEdge<TNodeMeta, TEdgeMeta>>,
  edgeErrors?: Set<IEdge<TNodeMeta, TEdgeMeta>>
): IAddEdgeResult<TNodeMeta, TEdgeMeta> {
  // Ensure we process a list
  edges = makeList(edges);
  // Tracks list of edges that were added in the operation
  addedEdges = addedEdges || new Set();
  // Tracks edges that had an error while trying to add it
  const errors: Set<IEdge<TNodeMeta, TEdgeMeta>> = edgeErrors || new Set();

  // Process all edge adds that will happen
  for (let i = 0, iMax = edges.length; i < iMax; ++i) {
    const edge = edges[i];

    // We do not perform an add if the edge id is already a part of the network
    if (network.edgeMap.has(edge.id)) {
      // If this was an edge added from processing added edges then this is not an error
      if (!addedEdges.has(edge)) {
        errors.add(edge);
      }

      continue;
    }

    // If the network does not have the edge's a or b nodes, we can not add the edge in
    if (!network.nodeMap.has(edge.a.id) || !network.nodeMap.has(edge.b.id)) {
      errors.add(edge);
      continue;
    }

    // Add the edge to the network
    network.edges.push(edge);
    // Add the lookup for the edge
    network.edgeMap.set(edge.id, edge);
    // Add the node lookup for the edge
    addToMapOfMaps(network.atobMap, edge.a, edge.b, edge);
    // Ensure the edge exists on the nodes it's associated with
    let edgeIndex = edge.a.out.indexOf(edge);
    if (edgeIndex < 0) edge.a.out.push(edge);
    edgeIndex = edge.b.in.indexOf(edge);
    if (edgeIndex < 0) edge.b.in.push(edge);
    // Track the edge as being added successfully
    addedEdges.add(edge);
  }

  return {
    edges: addedEdges,
    errors: errors.size > 0 ? errors : null
  };
}

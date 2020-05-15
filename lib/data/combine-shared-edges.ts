import { ILockedEdge, INetworkData, INode } from "../types";
import { addToMapOfMaps, getFromMapOfMaps } from "../util/map-of-maps";
import { addEdge } from "./add-edge";
import { removeEdge } from "./remove-edge";

/**
 * This examines the network and lets you combine edge information for edges that share the same a to b connection.
 * This makes your network information a lot cleaner and easier to manipulate. You can store the multiple edge
 * information into the edge's meta data and value weights.
 *
 * It is highly recommended to run this on your network data if you suspect duplicate edges have been created.
 *
 * If you are positive your network edges are clean, then you can save some processing by not running this.
 */
export function combineSharedEdges<TNodeMeta, TEdgeMeta>(
  network: INetworkData<TNodeMeta, TEdgeMeta>,
  reduce: (
    edgeA: ILockedEdge<TNodeMeta, TEdgeMeta>,
    edgeB: ILockedEdge<TNodeMeta, TEdgeMeta>
  ) => ILockedEdge<TNodeMeta, TEdgeMeta>
): INetworkData<TNodeMeta, TEdgeMeta> {
  const found = new Map<
    INode<TNodeMeta, TEdgeMeta>,
    Map<INode<TNodeMeta, TEdgeMeta>, ILockedEdge<TNodeMeta, TEdgeMeta>>
  >();
  const edges = network.edges.slice(0);

  for (let i = 0, iMax = edges.length; i < iMax; ++i) {
    const edge = edges[i];
    let previous = getFromMapOfMaps(found, edge.a, edge.b);
    if (!previous) previous = getFromMapOfMaps(found, edge.b, edge.a);

    if (previous) {
      const combined = reduce(previous, edge);
      removeEdge(network, previous);
      removeEdge(network, edge);
      addEdge(network, combined);
      addToMapOfMaps(found, combined.a, combined.b, combined);
    } else {
      addToMapOfMaps(found, edge.a, edge.b, edge);
    }
  }

  return network;
}

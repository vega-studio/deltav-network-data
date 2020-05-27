import { INetworkData } from "../types";
import { removeEdge } from "./remove-edge";

/**
 * This method removes any edge from the network that starts and ends at the
 * same node.
 */
export function removeCircularEdges<TNodeMeta, TEdgeMeta>(network: INetworkData<TNodeMeta, TEdgeMeta>) {
  const edges = network.edges.slice(0);

  for (let i = 0, iMax = edges.length; i < iMax; ++i) {
    const edge = edges[i];

    if (edge.a === edge.b) {
      removeEdge(network, edge);
    }
  }

  return network;
}

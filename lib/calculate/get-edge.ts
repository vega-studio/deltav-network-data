import { AnalyzeNetwork, AnalyzeNode, IEdge } from "../types";
import { getFromMapOfMaps } from "../util/map-of-maps";

/**
 * This checks the network to see if a connection exists between two nodes. If
 * one does not exist, then this returns null.
 *
 * The network object is not required to find a result, but will speed this
 * method up considerably if you plan on calling it in large volumes.
 *
 * The nodes MUST be a part of a VALID network data object. If not, the behavior
 * of this method is undefined.
 */
export function getEdge<TNodeMeta, TEdgeMeta>(
  a: AnalyzeNode<TNodeMeta, TEdgeMeta>,
  b: AnalyzeNode<TNodeMeta, TEdgeMeta>,
  network?: AnalyzeNetwork<TNodeMeta, TEdgeMeta>
): IEdge<TNodeMeta, TEdgeMeta> | undefined {
  // If the network is provided, do the super speedy lookup
  if (network) {
    const atob = getFromMapOfMaps(network.atobMap, a, b);
    if (atob) return atob;
    return getFromMapOfMaps(network.atobMap, b, a);
  }

  // If no network is provided, we must look through the node's flows to get the
  // edge. We only have to look at the in and out of a single node, as we assume
  // these nodes originate from a valid Network Data object.
  let edge = a.in.find((edge) => edge.a === b);
  if (!edge) edge = a.out.find((edge) => edge.b === b);
  return edge;
}

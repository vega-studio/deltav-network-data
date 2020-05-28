import { AnalyzeNetwork, AnalyzeNodes, INode } from "../types";
import { makeList } from "../util/make-list";

/**
 * This method checks to see if one or more nodes are within the specified network. If any node in the list is not
 * in the network, this returns false. This performs the examination by node id.
 */
export function hasNode<TNodeMeta, TEdgeMeta>(
  network: AnalyzeNetwork<TNodeMeta, TEdgeMeta>,
  nodes: AnalyzeNodes<TNodeMeta, TEdgeMeta> | INode<TNodeMeta, TEdgeMeta>[]
) {
  // Ensure we are working with a list
  nodes = makeList(nodes);

  // Check each item in the list for existance within the network specified
  for (let i = 0, iMax = nodes.length; i < iMax; ++i) {
    const node = nodes[i];
    if (!network.nodeMap.has(node.id)) return false;
  }

  // If we reach here, then all nodes are in network
  return true;
}

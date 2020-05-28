import { AnalyzeNode } from "../types";

/**
 * Examines a node and determines if it has a circular edge reference to itself
 * or not.
 */
export function hasCircularEdge<TNodeMeta, TEdgeMeta>(
  node: AnalyzeNode<TNodeMeta, TEdgeMeta>
) {
  // Get the shortest list to loop through. Both in AND out listings will have
  // the same circular references if any exists
  const edgeList = node.in.length > node.out.length ? node.out : node.in;
  // If either list is empty, it's impossible to have a circular reference.
  if (node.in.length === 0 || node.out.length === 0) return false;

  // Check each edge in the shortest list for equivalent end points
  for (let i = 0, iMax = edgeList.length; i < iMax; ++i) {
    const edge = edgeList[i];
    if (edge.a === edge.b) return true;
  }

  // No circular references detected if we reached this point.
  return false;
}

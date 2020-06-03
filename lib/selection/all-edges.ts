import { AnalyzeNode, IEdge, INode } from "../types";
import { makeList } from "../util";

/**
 * Retrieves the set of edges from all nodes specified
 */
export function allEdges<TNodeMeta, TEdgeMeta>(
  node: AnalyzeNode<TNodeMeta, TEdgeMeta> | INode<TNodeMeta, TEdgeMeta>[],
  out?: Set<IEdge<TNodeMeta, TEdgeMeta>>
) {
  const nodes = makeList(node);
  const edges = out || new Set<IEdge<TNodeMeta, TEdgeMeta>>();

  for (let i = 0, iMax = nodes.length; i < iMax; ++i) {
    const processNode = nodes[i];

    for (let k = 0, kMax = processNode.in.length; k < kMax; ++k) {
      edges.add(processNode.in[k]);
    }

    for (let k = 0, kMax = processNode.out.length; k < kMax; ++k) {
      edges.add(processNode.out[k]);
    }
  }

  return edges;
}

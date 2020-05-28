import { getEdge } from "../calculate/get-edge";
import {
  AnalyzeEdge,
  AnalyzeNode,
  AnalyzeNodeList,
  IEdge,
  INode,
  isEdge,
  isNode,
  ReversePathMap,
} from "../types";
import { travelPath } from "./travel-path";

/**
 * It's a special case when a collision occurs and you want to travel along it's
 * path. Essentially, when a collision happens, there are multiple paths that
 * can be taken as there are multiple sources that reached the node at the same
 * time in a ripple select. This will travel all of the paths back to the
 * sources and include the start node or edge.
 *
 * The collision node will be included for each path traversed (when step === 0)
 * and each path will increment the path feedback int he callbacks.
 */
export function travelCollisionPath<TNodeMeta, TEdgeMeta>(
  collision:
    | AnalyzeNode<TNodeMeta, TEdgeMeta>
    | AnalyzeEdge<TNodeMeta, TEdgeMeta>,
  sources: AnalyzeNodeList<TNodeMeta, TEdgeMeta>,
  path: ReversePathMap<TNodeMeta, TEdgeMeta>,
  nodeResult: (
    node: INode<TNodeMeta, TEdgeMeta>,
    step: number,
    path: number
  ) => void,
  edgeResult: (
    edge: IEdge<TNodeMeta, TEdgeMeta>,
    step: number,
    path: number
  ) => void
) {
  // If our collision is an edge, then our sources are naturally the ends of the
  // edge, so we disregard any sources provided
  if (isEdge(collision)) {
    sources = [collision.a, collision.b];
  }

  // Loop through each source and start with the collision node and the edge to
  // that node, then perform a normal traversal
  for (let i = 0, iMax = sources.length; i < iMax; ++i) {
    let step = -1;
    const source = sources[i];

    if (isNode(collision)) {
      nodeResult(collision, ++step, i);
      const edge = getEdge(source, collision);

      if (!edge) {
        console.warn(
          "There was no edge from the source node to the rest of the path",
          "This indicates malformed data, thus it should be ensured that the data",
          "being queried should come from a VALID Network Data object."
        );
        continue;
      }

      edgeResult(edge, ++step, i);
    } else {
      edgeResult(collision, ++step, i);
    }

    // We now traverse the remainder of the path from the node beyond the
    // collision using our normal path traversal system.
    travelPath(
      source,
      path,
      (node) => nodeResult(node, ++step, i),
      (edge) => edgeResult(edge, ++step, i)
    );
  }
}

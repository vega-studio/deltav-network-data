import { getEdge } from "../calculate/get-edge";
import { IEdge, INetworkData, INode, ReversePathMap } from "../types";

/**
 * This takes a node and a path mapping and returns a callback for each element
 * along the path starting at the input node and continues until the path start
 * is found.
 *
 * You can provide the network the path is a part of to speed up calculations.
 */
export function travelPath<TNodeMeta, TEdgeMeta>(
  start: INode<TNodeMeta, TEdgeMeta>,
  path: ReversePathMap<TNodeMeta, TEdgeMeta>,
  nodeResult: (next: INode<TNodeMeta, TEdgeMeta>, step: number) => void,
  edgeResult: (next: IEdge<TNodeMeta, TEdgeMeta>, step: number) => void,
  network?: INetworkData<TNodeMeta, TEdgeMeta>
) {
  let step = -1;
  let next: INode<TNodeMeta, TEdgeMeta> | undefined = start;

  while (next) {
    nodeResult(next, ++step);
    const current = next;
    next = path.get(next);

    // If we have a next element, we get the edge to it first for broadcasting
    if (next) {
      const edge = getEdge(next, current, network);

      if (!edge) {
        console.warn(
          "Traveled a path that had two nodes with no connecting edge.",
          "This is an error with the input data structure.",
          "Please make sure all your nodes are a part of a VALID Network Data object"
        );
        return;
      }

      edgeResult(edge, ++step);
    }
  }
}

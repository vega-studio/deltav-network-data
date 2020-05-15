import { INetworkData, INode } from "../types";

/**
 * This method will calculate the intersection of elements between two networks. This uses identifiers and not object
 * references to make the associations.
 *
 * Intersection means only elements that appear in Set A AND Set B
 *
 * A: {1, 3, 4, 9}
 * B: {2, 4, 5, 9}
 *
 * result: {4, 9}
 *
 * @param a First network to compare against
 * @param b Second network to compare against
 * @param nodeIntersection This is called when two nodes are valid intersections. You have the opportunity to merge
 *                         the nodes how you see fit and return the merged node.
 * @param edgeIntersection This is called when two edges are valid intersections. You have the opportunity to merge
 *                         the edges how you see fit and return the merged edge.
 */
export function intersection<TNodeMeta, TEdgeMeta>(
  _a: INetworkData<TNodeMeta, TEdgeMeta>,
  _b: INetworkData<TNodeMeta, TEdgeMeta>,
  _nodeIntersection: (
    nodeA: INode<TNodeMeta, TEdgeMeta>,
    nodeB: INode<TNodeMeta, TEdgeMeta>
  ) => INode<TNodeMeta, TEdgeMeta>,
  _edgeIntersection: (
    nodeA: INode<TNodeMeta, TEdgeMeta>,
    nodeB: INode<TNodeMeta, TEdgeMeta>
  ) => INode<TNodeMeta, TEdgeMeta>
): INetworkData<TNodeMeta, TEdgeMeta> | null {
  // TODO
  return null;
}

/**
 * This method will calculate the union of elements between two networks.
 *
 * Union means elements that appear in both sets, but no duplicates.
 *
 * A: {1, 3, 4, 9}
 * B: {2, 4, 5, 9}
 *
 * result: {1, 2, 3, 4, 5, 9}
 *
 * @param a First network to compare against
 * @param b Second network to compare against
 * @param nodeIntersection This is called when two nodes are valid intersections. You have the opportunity to merge
 *                         the nodes how you see fit and return the merged node.
 * @param edgeIntersection This is called when two edges are valid intersections. You have the opportunity to merge
 *                         the edges how you see fit and return the merged edge.
 */
export function union<TNodeMeta, TEdgeMeta>(
  _a: INetworkData<TNodeMeta, TEdgeMeta>,
  _b: INetworkData<TNodeMeta, TEdgeMeta>,
  _nodeIntersection: (
    nodeA: INode<TNodeMeta, TEdgeMeta>,
    nodeB: INode<TNodeMeta, TEdgeMeta>
  ) => INode<TNodeMeta, TEdgeMeta>,
  _edgeIntersection: (
    nodeA: INode<TNodeMeta, TEdgeMeta>,
    nodeB: INode<TNodeMeta, TEdgeMeta>
  ) => INode<TNodeMeta, TEdgeMeta>
): INetworkData<TNodeMeta, TEdgeMeta> | null {
  // TODO
  return null;
}

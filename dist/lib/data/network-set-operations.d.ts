import { AnalyzeNetwork, IEdge, INetworkData, INode, ProcessNetwork } from "../types";
export declare enum IntersectMode {
    USE_A = 0,
    USE_B = 1,
    INTERSECT = 2
}
interface IIntersect<TNodeMeta, TEdgeMeta> {
    type: IntersectMode;
    nodeIntersection?(nodeA: INode<TNodeMeta, TEdgeMeta>, nodeB: INode<TNodeMeta, TEdgeMeta>): INode<TNodeMeta, TEdgeMeta>;
    edgeIntersection?(edgeA: IEdge<TNodeMeta, TEdgeMeta>, edgeB: IEdge<TNodeMeta, TEdgeMeta>): IEdge<TNodeMeta, TEdgeMeta>;
}
interface IIntersectUse<TNodeMeta, TEdgeMeta> extends IIntersect<TNodeMeta, TEdgeMeta> {
    type: IntersectMode.USE_A | IntersectMode.USE_B;
}
interface IIntersectMerge<TNodeMeta, TEdgeMeta> extends IIntersect<TNodeMeta, TEdgeMeta> {
    type: IntersectMode.INTERSECT;
    nodeIntersection(nodeA: INode<TNodeMeta, TEdgeMeta>, nodeB: INode<TNodeMeta, TEdgeMeta>): INode<TNodeMeta, TEdgeMeta>;
    edgeIntersection(edgeA: IEdge<TNodeMeta, TEdgeMeta>, edgeB: IEdge<TNodeMeta, TEdgeMeta>): IEdge<TNodeMeta, TEdgeMeta>;
}
/**
 * This method will calculate the intersection of elements between two networks.
 * This uses identifiers and not object references to make the associations.
 *
 * Intersection means only elements that appear in Set A AND Set B. Essentially
 * the opposite result of difference.
 *
 * A: {1, 3, 4, 9} B: {2, 4, 5, 9}
 *
 * result: {4, 9}
 *
 * @param a First network to compare against
 * @param b Second network to compare against
 * @param strategy This sets which node or edge to pick when forming the
 *                 intersected networok. This allows some intervention in which
 *                 objects to pick, as well as provide a way to create
 *                 completely new objects for selection.
 */
export declare function intersection<TNodeMeta, TEdgeMeta>(a: AnalyzeNetwork<TNodeMeta, TEdgeMeta>, b: AnalyzeNetwork<TNodeMeta, TEdgeMeta>, strategy: IIntersectUse<TNodeMeta, TEdgeMeta> | IIntersectMerge<TNodeMeta, TEdgeMeta>): Promise<ProcessNetwork<TNodeMeta, TEdgeMeta> | null>;
/**
 * This method will calculate the union of elements between two networks.
 *
 * Union means elements that appear in both sets, but no duplicates. Essentially
 * the opposite result of intersection.
 *
 * A: {1, 3, 4, 9} B: {2, 4, 5, 9}
 *
 * result: {1, 2, 3, 4, 5, 9}
 *
 * @param a First network to compare against
 * @param b Second network to compare against
 * @param nodeIntersection This is called when two nodes are valid
 *                         intersections. You have the opportunity to merge the
 *                         nodes how you see fit and return the merged node.
 * @param edgeIntersection This is called when two edges are valid
 *                         intersections. You have the opportunity to merge the
 *                         edges how you see fit and return the merged edge.
 */
export declare function union<TNodeMeta, TEdgeMeta>(a: AnalyzeNetwork<TNodeMeta, TEdgeMeta>, b: AnalyzeNetwork<TNodeMeta, TEdgeMeta>, strategy: IIntersectUse<TNodeMeta, TEdgeMeta>): Promise<ProcessNetwork<TNodeMeta, TEdgeMeta> | null>;
/**
 * This method will calculate the difference of elements between two networks.
 *
 * Difference means elements that do NOT appear in both sets
 *
 * A: {1, 3, 4, 9} B: {2, 4, 5, 9}
 *
 * result: {1, 2, 3, 5}
 *
 * @param a First network to compare against
 * @param b Second network to compare against
 * @param nodeIntersection This is called when two nodes are valid
 *                         intersections. You have the opportunity to merge the
 *                         nodes how you see fit and return the merged node.
 * @param edgeIntersection This is called when two edges are valid
 *                         intersections. You have the opportunity to merge the
 *                         edges how you see fit and return the merged edge.
 */
export declare function difference<TNodeMeta, TEdgeMeta>(a: AnalyzeNetwork<TNodeMeta, TEdgeMeta>, b: AnalyzeNetwork<TNodeMeta, TEdgeMeta>): Promise<INetworkData<TNodeMeta, TEdgeMeta>>;
export declare const NetworkSet: {
    union: typeof union;
    intersection: typeof intersection;
    difference: typeof difference;
};
export {};

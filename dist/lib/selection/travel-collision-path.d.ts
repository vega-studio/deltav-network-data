import { IEdge, INode, ReversePathMap } from "../types";
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
export declare function travelCollisionPath<TNodeMeta, TEdgeMeta>(collision: INode<TNodeMeta, TEdgeMeta> | IEdge<TNodeMeta, TEdgeMeta>, sources: INode<TNodeMeta, TEdgeMeta>[], path: ReversePathMap<TNodeMeta, TEdgeMeta>, nodeResult: (node: INode<TNodeMeta, TEdgeMeta>, step: number, path: number) => void, edgeResult: (edge: IEdge<TNodeMeta, TEdgeMeta>, step: number, path: number) => void): void;

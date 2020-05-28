import { IEdge, INetworkData, INode } from "../types";
export declare type PathNode<TNodeMeta, TEdgeMeta> = [INode<TNodeMeta, TEdgeMeta>] | [INode<TNodeMeta, TEdgeMeta>, IEdge<TNodeMeta, TEdgeMeta>];
export declare type PathResult<TNodeMeta, TEdgeMeta> = PathNode<TNodeMeta, TEdgeMeta>[];
/**
 * TODO: NOT IMPLEMENTED
 *
 * This method provides the shortest path between two nodes. The path is a list
 * of each node, in order, from point a to point b.
 *
 * If there are equally long paths between the two nodes, this will provide
 * all paths available.
 *
 * A stepper function can be provided to control how fast the pathing eats
 * through the network. This utilizes the Ripple Search, so you can read on that
 * operation to determine how best to utilize making the system wait per step to
 * save on processing per frame. If you do not provide the stepper callback, the
 * search will be blocking until a result is achieved.
 */
export declare function path<TNodeMeta, TEdgeMeta>(network: INetworkData<TNodeMeta, TEdgeMeta>, a: INode<TNodeMeta, TEdgeMeta>, b: INode<TNodeMeta, TEdgeMeta>, step?: () => Promise<void>): Promise<PathResult<TNodeMeta, TEdgeMeta>[]>;

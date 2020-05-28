import { IEdge, INetworkData, INode, ReversePathMap } from "../types";
/**
 * This takes a node and a path mapping and returns a callback for each element
 * along the path starting at the input node and continues until the path start
 * is found.
 *
 * You can provide the network the path is a part of to speed up calculations.
 */
export declare function travelPath<TNodeMeta, TEdgeMeta>(start: INode<TNodeMeta, TEdgeMeta>, path: ReversePathMap<TNodeMeta, TEdgeMeta>, nodeResult: (next: INode<TNodeMeta, TEdgeMeta>, step: number) => void, edgeResult: (next: IEdge<TNodeMeta, TEdgeMeta>, step: number) => void, network?: INetworkData<TNodeMeta, TEdgeMeta>): void;

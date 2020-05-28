import { INetworkData } from "../types";
/**
 * Produces all nodes that are not connected to anything
 */
export declare function noConnections<TNodeMeta, TEdgeMeta>(network: INetworkData<TNodeMeta, TEdgeMeta>): import("../types").INode<TNodeMeta, TEdgeMeta>[];

import { IEdge, INetworkData, INode } from "../types";
/**
 * This checks the network to see if a connection exists between two nodes. If
 * one does not exist, then this returns null.
 *
 * The network object is not required to find a result, but will speed this
 * method up considerably if you plan on calling it in large volumes.
 *
 * The nodes MUST be a part of a VALID network data object. If not, the behavior
 * of this method is undefined.
 */
export declare function getEdge<TNodeMeta, TEdgeMeta>(a: INode<TNodeMeta, TEdgeMeta>, b: INode<TNodeMeta, TEdgeMeta>, network?: INetworkData<TNodeMeta, TEdgeMeta>): IEdge<TNodeMeta, TEdgeMeta> | undefined;

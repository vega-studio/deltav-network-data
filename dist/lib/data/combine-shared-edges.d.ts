import { ILockedEdge, INetworkData } from "../types";
/**
 * This examines the network and lets you combine edge information for edges that share the same a to b connection.
 * This makes your network information a lot cleaner and easier to manipulate. You can store the multiple edge
 * information into the edge's meta data and value weights.
 *
 * It is highly recommended to run this on your network data if you suspect duplicate edges have been created.
 *
 * If you are positive your network edges are clean, then you can save some processing by not running this.
 */
export declare function combineSharedEdges<TNodeMeta, TEdgeMeta>(network: INetworkData<TNodeMeta, TEdgeMeta>, reduce: (edgeA: ILockedEdge<TNodeMeta, TEdgeMeta>, edgeB: ILockedEdge<TNodeMeta, TEdgeMeta>) => ILockedEdge<TNodeMeta, TEdgeMeta>): INetworkData<TNodeMeta, TEdgeMeta>;

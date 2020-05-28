import { INetworkData } from "../types";
/**
 * This method removes any edge from the network that starts and ends at the
 * same node.
 */
export declare function removeCircularEdges<TNodeMeta, TEdgeMeta>(network: INetworkData<TNodeMeta, TEdgeMeta>): INetworkData<TNodeMeta, TEdgeMeta>;

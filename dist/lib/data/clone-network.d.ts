import { INetworkData } from "../types";
/**
 * This deep clones a network object (except for meta data)
 */
export declare function cloneNetwork<TNodeMeta, TEdgeMeta>(network: INetworkData<TNodeMeta, TEdgeMeta>): INetworkData<TNodeMeta, TEdgeMeta>;

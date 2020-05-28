import { ProcessNetwork } from "../types";
/**
 * This method removes any edge from the network that starts and ends at the
 * same node.
 */
export declare function removeCircularEdges<TNodeMeta, TEdgeMeta>(network: ProcessNetwork<TNodeMeta, TEdgeMeta>): ProcessNetwork<TNodeMeta, TEdgeMeta>;

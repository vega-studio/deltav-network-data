import { INetworkData } from "../types";

/**
 * Produces all nodes that are not connected to anything
 */
export function noConnections<TNodeMeta, TEdgeMeta>(network: INetworkData<TNodeMeta, TEdgeMeta>) {
  return network.nodes.filter(n => n.in.length === 0 && n.out.length === 0);
}

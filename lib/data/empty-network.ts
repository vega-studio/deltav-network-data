import { INetworkData } from "../types";

/**
 * Generates a network with nothing in it.
 */
export function emptyNetwork<TNodeMeta, TEdgeMeta>(): INetworkData<
  TNodeMeta,
  TEdgeMeta
> {
  return {
    nodes: [],
    nodeMap: new Map(),
    edges: [],
    edgeMap: new Map(),
    atobMap: new Map(),
  };
}

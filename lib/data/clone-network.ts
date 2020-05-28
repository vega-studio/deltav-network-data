import { AnalyzeNetwork, IEdge, INetworkData, INode } from "../types";
import { cloneEdge } from "./clone-edge";
import { cloneNode } from "./clone-node";

/**
 * This deep clones a network object (except for meta data)
 */
export function cloneNetwork<TNodeMeta, TEdgeMeta>(
  network: AnalyzeNetwork<TNodeMeta, TEdgeMeta>
): INetworkData<TNodeMeta, TEdgeMeta> {
  const atobMap = new Map();
  const edgeMap = new Map();
  const nodeMap = new Map();

  // Clone all nodes
  const nodes: INode<TNodeMeta, TEdgeMeta>[] = new Array(network.nodes.length);
  for (let i = 0, iMax = network.nodes.length; i < iMax; ++i) {
    const node = cloneNode(network.nodes[i]);
    nodeMap.set(node.id, node);
    nodes[i] = node;
  }

  // Clone all edges
  const edges: IEdge<TNodeMeta, TEdgeMeta>[] = new Array(network.edges.length);
  for (let i = 0, iMax = network.edges.length; i < iMax; ++i) {
    const edge = cloneEdge(network.edges[i]);
    edgeMap.set(edge.id, edge);
    edges[i] = edge;
  }

  // Shift all edge references to new Edge Object references
  for (let i = 0, iMax = nodes.length; i < iMax; ++i) {
    const node = nodes[i];
    node.in = node.in.map((edge) => edgeMap.get(edge.id)).filter(Boolean);
    node.out = node.out.map((edge) => edgeMap.get(edge.id)).filter(Boolean);
  }

  // Shift all edge node references to new Node Object references
  for (let i = 0, iMax = edges.length; i < iMax; ++i) {
    const edge = edges[i];
    edge.a = nodeMap.get(edge.a.id);
    edge.b = nodeMap.get(edge.b.id);
  }

  // Update the a to b mapping
  network.atobMap.forEach((map, nodeA) => {
    const mapB = new Map();
    atobMap.set(nodeMap.get(nodeA.id), mapB);
    map.forEach((edge, nodeB) =>
      mapB.set(nodeMap.get(nodeB.id), edgeMap.get(edge.id))
    );
  });

  return {
    atobMap,
    edgeMap,
    edges,
    nodeMap,
    nodes,
  };
}

import { INetworkData } from "../types";
import { cloneEdge } from "./clone-edge";
import { cloneNode } from "./clone-node";

/**
 * This deep clones a network object (except for meta data)
 */
export function cloneNetwork<TNodeMeta, TEdgeMeta>(
  network: INetworkData<TNodeMeta, TEdgeMeta>
): INetworkData<TNodeMeta, TEdgeMeta> {
  const atobMap = new Map();
  const edgeMap = new Map();
  const nodeMap = new Map();

  // Clone all nodes
  const nodes = network.nodes.map((n) => {
    const node = cloneNode(n);
    nodeMap.set(node.id, node);

    return node;
  });

  // Clone all edges
  const edges = network.edges.map((e) => {
    const edge = cloneEdge(e);
    edgeMap.set(edge.id, edge);

    return edge;
  });

  // Shift all edge references to new Edge Object references
  nodes.forEach((node) => {
    node.in = node.in.map((edge) => edgeMap.get(edge.id)).filter(Boolean);
    node.out = node.out.map((edge) => edgeMap.get(edge.id)).filter(Boolean);
  });

  // Shift all edge node references to new Node Object references
  edges.forEach((edge) => {
    edge.a = nodeMap.get(edge.a.id);
    edge.b = nodeMap.get(edge.b.id);
  });

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

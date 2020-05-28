import { IdentifiableById } from "deltav";
import { AnalyzeEdge, AnalyzeNetwork, AnalyzeNode, Weights } from "../types";

/**
 * This compares two lists of items that have an ID property
 */
export function compareIdentifiers(
  a: IdentifiableById[],
  b: IdentifiableById[]
) {
  if (a.length !== b.length) return false;

  for (let i = 0, iMax = a.length; i < iMax; ++i) {
    if (a[i].id !== b[i].id) return false;
  }

  return true;
}

/**
 * This compares two weight values with each other
 */
export function compareWeights(weightA: Weights, weightB: Weights) {
  const isList = Array.isArray(weightA);
  if (isList !== Array.isArray(weightB)) return false;
  if (isList) {
    const A = weightA as number[];
    const B = weightB as number[];
    if (A.length !== B.length) return false;

    for (let i = 0, iMax = A.length; i < iMax; ++i) {
      if (A[i] !== B[i]) return false;
    }
  } else {
    return weightA === weightB;
  }

  return true;
}

/**
 * This compares two nodes to see if they have the same properties. Edge references are compared by id.
 */
export function compareNodes<TNodeMeta, TEdgeMeta>(
  nodeA: AnalyzeNode<TNodeMeta, TEdgeMeta>,
  nodeB: AnalyzeNode<TNodeMeta, TEdgeMeta>
) {
  return (
    nodeA.id === nodeB.id &&
    nodeA.meta === nodeB.meta &&
    compareIdentifiers(nodeA.in, nodeB.in) &&
    compareIdentifiers(nodeA.out, nodeB.out) &&
    compareWeights(nodeA.value, nodeB.value)
  );
}

/**
 * This compares two edges to see if they have the same properties. Node references are compared by id.
 */
export function compareEdges<TNodeMeta, TEdgeMeta>(
  edgeA: AnalyzeEdge<TNodeMeta, TEdgeMeta>,
  edgeB: AnalyzeEdge<TNodeMeta, TEdgeMeta>
) {
  return (
    edgeA.a.id === edgeB.a.id &&
    edgeA.b.id === edgeB.b.id &&
    edgeA.id === edgeB.id &&
    edgeA.meta === edgeB.meta &&
    compareWeights(edgeA.atob, edgeB.atob) &&
    compareWeights(edgeA.btoa, edgeB.btoa)
  );
}

/**
 * This compares two networks equivalence.
 */
export function compareNetworks<TNodeMeta, TEdgeMeta>(
  networkA: AnalyzeNetwork<TNodeMeta, TEdgeMeta>,
  networkB: AnalyzeNetwork<TNodeMeta, TEdgeMeta>
) {
  // Check for node equivalence
  if (networkA.nodes.length !== networkB.nodes.length) return false;

  for (let i = 0, iMax = networkA.nodes.length; i < iMax; ++i) {
    const nodeA = networkA.nodes[i];
    const nodeB = networkA.nodes[i];

    if (!compareNodes(nodeA, nodeB)) {
      return false;
    }
  }

  // Check for edge equivalence
  if (networkA.edges.length !== networkB.edges.length) return false;

  for (let i = 0, iMax = networkA.edges.length; i < iMax; ++i) {
    const edgeA = networkA.edges[i];
    const edgeB = networkA.edges[i];

    if (!compareEdges(edgeA, edgeB)) {
      return false;
    }
  }

  return true;
}

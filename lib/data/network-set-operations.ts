import { getEdge } from "../calculate";
import { IEdge, INetworkData, INode } from "../types";
import { addToMapOfMaps } from "../util";
import { cloneEdge } from "./clone-edge";
import { cloneNode } from "./clone-node";
import { emptyNetwork } from "./empty-network";
import { makeNetwork, MakeNetworkAggregateValueMode } from "./make-network";

export enum IntersectMode {
  USE_A,
  USE_B,
  INTERSECT,
}

interface IIntersect<TNodeMeta, TEdgeMeta> {
  type: IntersectMode;
  nodeIntersection?(
    nodeA: INode<TNodeMeta, TEdgeMeta>,
    nodeB: INode<TNodeMeta, TEdgeMeta>
  ): INode<TNodeMeta, TEdgeMeta>;
  edgeIntersection?(
    edgeA: IEdge<TNodeMeta, TEdgeMeta>,
    edgeB: IEdge<TNodeMeta, TEdgeMeta>
  ): IEdge<TNodeMeta, TEdgeMeta>;
}

interface IIntersectUse<TNodeMeta, TEdgeMeta>
  extends IIntersect<TNodeMeta, TEdgeMeta> {
  type: IntersectMode.USE_A | IntersectMode.USE_B;
}

interface IIntersectMerge<TNodeMeta, TEdgeMeta>
  extends IIntersect<TNodeMeta, TEdgeMeta> {
  type: IntersectMode.INTERSECT;
  nodeIntersection(
    nodeA: INode<TNodeMeta, TEdgeMeta>,
    nodeB: INode<TNodeMeta, TEdgeMeta>
  ): INode<TNodeMeta, TEdgeMeta>;
  edgeIntersection(
    edgeA: IEdge<TNodeMeta, TEdgeMeta>,
    edgeB: IEdge<TNodeMeta, TEdgeMeta>
  ): IEdge<TNodeMeta, TEdgeMeta>;
}

/**
 * This method will calculate the intersection of elements between two networks.
 * This uses identifiers and not object references to make the associations.
 *
 * Intersection means only elements that appear in Set A AND Set B. Essentially
 * the opposite result of difference.
 *
 * A: {1, 3, 4, 9} B: {2, 4, 5, 9}
 *
 * result: {4, 9}
 *
 * @param a First network to compare against
 * @param b Second network to compare against
 * @param strategy This sets which node or edge to pick when forming the
 *                 intersected networok. This allows some intervention in which
 *                 objects to pick, as well as provide a way to create
 *                 completely new objects for selection.
 */
export async function intersection<TNodeMeta, TEdgeMeta>(
  a: INetworkData<TNodeMeta, TEdgeMeta>,
  b: INetworkData<TNodeMeta, TEdgeMeta>,
  strategy:
    | IIntersectUse<TNodeMeta, TEdgeMeta>
    | IIntersectMerge<TNodeMeta, TEdgeMeta>
): Promise<INetworkData<TNodeMeta, TEdgeMeta> | null> {
  // This will be the network object we aggregate our newly formed network data
  // into.
  const network: INetworkData<TNodeMeta, TEdgeMeta> = emptyNetwork();
  let pickNode: (
    nodeA: INode<TNodeMeta, TEdgeMeta>,
    nodeB: INode<TNodeMeta, TEdgeMeta>
  ) => INode<TNodeMeta, TEdgeMeta>;
  let pickEdge: (
    edgeA: IEdge<TNodeMeta, TEdgeMeta>,
    edgeB: IEdge<TNodeMeta, TEdgeMeta>
  ) => IEdge<TNodeMeta, TEdgeMeta>;

  // Determine how we pick an edge between two networks
  if (strategy.type === IntersectMode.USE_B) {
    pickNode = (
      _: INode<TNodeMeta, TEdgeMeta>,
      nodeB: INode<TNodeMeta, TEdgeMeta>
    ) => nodeB;
    pickEdge = (
      _: IEdge<TNodeMeta, TEdgeMeta>,
      edgeB: IEdge<TNodeMeta, TEdgeMeta>
    ) => edgeB;
  } else if (strategy.type === IntersectMode.INTERSECT) {
    pickNode = strategy.nodeIntersection;
    pickEdge = strategy.edgeIntersection;
  } else {
    pickNode = (
      nodeA: INode<TNodeMeta, TEdgeMeta>,
      _: INode<TNodeMeta, TEdgeMeta>
    ) => nodeA;
    pickEdge = (
      edgeA: IEdge<TNodeMeta, TEdgeMeta>,
      _: IEdge<TNodeMeta, TEdgeMeta>
    ) => edgeA;
  }

  // We must loop through only one of the networks and determine if the network
  // has elements that exists in the other network
  for (let i = 0, iMax = a.nodes.length; i < iMax; ++i) {
    const nodeA = a.nodes[i];
    const nodeB = b.nodeMap.get(nodeA.id);

    if (nodeB) {
      const combined = cloneNode(pickNode(nodeA, nodeB));
      // Add the combined node into our new network. As a precaution we will
      // make it a new Object reference so we reduce confusion by not allowing
      // modifications of this object to affect the two input networks.
      combined.in = [];
      combined.out = [];
      network.nodes.push(combined);
      network.nodeMap.set(combined.id, combined);
    }
  }

  // We now loop through all of the edges and weigh each edge's a and b
  // identifiers against the nodes we have found to be shared. This will allow
  // us to identify which edge's would be valid in the intersection. We then
  // take that edge and weigh it against the other network's a to b map to see
  // if they share the same edge.
  for (let i = 0, iMax = a.edges.length; i < iMax; ++i) {
    const edge = a.edges[i];
    const nodeA = network.nodeMap.get(edge.a.id);
    const nodeB = network.nodeMap.get(edge.b.id);

    // See if we have the shared nodes
    if (nodeA && nodeB) {
      // Make sure the other network has the same connection
      const checkA = b.nodeMap.get(edge.a.id);
      const checkB = b.nodeMap.get(edge.b.id);
      if (!checkA || !checkB) continue;
      const checkEdge = getEdge(checkA, checkB, b);
      if (!checkEdge) continue;
      // At this point, we have determined both networks have the same node to
      // node connection. So we should add the edge to the new network
      const combined = cloneEdge(pickEdge(edge, checkEdge));
      combined.a = nodeA;
      combined.b = nodeB;
      network.edges.push(combined);
      network.edgeMap.set(combined.id, combined);
      nodeA.out.push(combined);
      nodeB.in.push(combined);
      addToMapOfMaps(network.atobMap, combined.a, combined.b, combined);
    }
  }

  return network;
}

/**
 * This method will calculate the union of elements between two networks.
 *
 * Union means elements that appear in both sets, but no duplicates. Essentially
 * the opposite result of intersection.
 *
 * A: {1, 3, 4, 9} B: {2, 4, 5, 9}
 *
 * result: {1, 2, 3, 4, 5, 9}
 *
 * @param a First network to compare against
 * @param b Second network to compare against
 * @param nodeIntersection This is called when two nodes are valid
 *                         intersections. You have the opportunity to merge the
 *                         nodes how you see fit and return the merged node.
 * @param edgeIntersection This is called when two edges are valid
 *                         intersections. You have the opportunity to merge the
 *                         edges how you see fit and return the merged edge.
 */
export async function union<TNodeMeta, TEdgeMeta>(
  a: INetworkData<TNodeMeta, TEdgeMeta>,
  b: INetworkData<TNodeMeta, TEdgeMeta>,
  strategy: IIntersectUse<TNodeMeta, TEdgeMeta>
): Promise<INetworkData<TNodeMeta, TEdgeMeta> | null> {
  let allNodes = a.nodes.concat(b.nodes);
  let allEdges = a.edges.concat(b.edges);
  let aggregateMode: MakeNetworkAggregateValueMode;

  if (strategy.type === IntersectMode.USE_B) {
    // We override as we process, so we make b values remain at the end making
    // them the remaining values
    aggregateMode = MakeNetworkAggregateValueMode.OVERRIDE;
    allNodes = a.nodes.concat(b.nodes);
    allEdges = a.edges.concat(b.edges);
  } else {
    // We override as we process, so we make a values remain at the end making
    // them the remaining values
    aggregateMode = MakeNetworkAggregateValueMode.OVERRIDE;
    allNodes = b.nodes.concat(a.nodes);
    allEdges = b.edges.concat(a.edges);
  }

  // Generate a new network by analyzing all of the original network data to
  // make a new network where we use the nodes and edge data of the previous
  // networks as the row data needed to make the new network.
  const network = await makeNetwork({
    // We aggregate results because we will have multiple overlapping nodes
    // potentially. The aggregation style will depend on the strategy for making
    // the union.
    aggregateResults: true,
    aggregateValueMode: aggregateMode,

    // Set the data to process for the network
    nodeData: allNodes,
    edgeData: allEdges,

    // Identify the relevant information for nodes
    nodeId: (node) => node.id,
    nodeMeta: (node) => node.meta as TNodeMeta,
    nodeValues: (node) => node.value,

    // Identify the relevant information for edges
    edgeId: (edge) => edge.id,
    edgeA: (edge) => edge.a.id,
    edgeB: (edge) => edge.b.id,
    edgeMeta: (edge) => edge.meta as TEdgeMeta,
    edgeValues: (edge) => ({ ab: edge.atob, ba: edge.btoa }),
  });

  return network;
}

/**
 * This method will calculate the difference of elements between two networks.
 *
 * Difference means elements that do NOT appear in both sets
 *
 * A: {1, 3, 4, 9} B: {2, 4, 5, 9}
 *
 * result: {1, 2, 3, 5}
 *
 * @param a First network to compare against
 * @param b Second network to compare against
 * @param nodeIntersection This is called when two nodes are valid
 *                         intersections. You have the opportunity to merge the
 *                         nodes how you see fit and return the merged node.
 * @param edgeIntersection This is called when two edges are valid
 *                         intersections. You have the opportunity to merge the
 *                         edges how you see fit and return the merged edge.
 */
export async function difference<TNodeMeta, TEdgeMeta>(
  a: INetworkData<TNodeMeta, TEdgeMeta>,
  b: INetworkData<TNodeMeta, TEdgeMeta>
) {
  // This will be the network object we aggregate our newly formed network data
  // into.
  const network: INetworkData<TNodeMeta, TEdgeMeta> = emptyNetwork();

  // We must loop through the first network and determine if the network
  // has elements that does not exist in the other network
  for (let i = 0, iMax = a.nodes.length; i < iMax; ++i) {
    const nodeA = a.nodes[i];
    const nodeB = b.nodeMap.get(nodeA.id);

    // If this does not exist in the other network, then we keep the node
    if (!nodeB) {
      network.nodes.push(nodeA);
      network.nodeMap.set(nodeA.id, nodeA);
    }
  }

  // Now we loop through the other network and determine if the network
  // has elements that does not exist in the first network
  for (let i = 0, iMax = b.nodes.length; i < iMax; ++i) {
    const nodeA = b.nodes[i];
    const nodeB = a.nodeMap.get(nodeA.id);

    // If this does not exist in the other network, then we keep the node
    if (!nodeB) {
      network.nodes.push(nodeA);
      network.nodeMap.set(nodeA.id, nodeA);
    }
  }

  // We now loop through all of the edges and weigh each edge's a and b
  // identifiers against the nodes we have found to be shared. This will allow
  // us to identify which edge's would be valid in the intersection. We then
  // take that edge and weigh it against the other network's a to b map to see
  // if they share the same edge.
  for (let i = 0, iMax = a.edges.length; i < iMax; ++i) {
    const edge = a.edges[i];
    const nodeA = network.nodeMap.get(edge.a.id);
    const nodeB = network.nodeMap.get(edge.b.id);

    // See if the nodes for the edges were kept when finding the different nodes
    // If both nodes are in our new network, then we keep the edge as well.
    if (nodeA && nodeB) {
      network.edges.push(edge);
      network.edgeMap.set(edge.id, edge);
      addToMapOfMaps(network.atobMap, edge.a, edge.b, edge);
    }
  }

  return network;
}

export const NetworkSet = {
  union,
  intersection,
  difference,
};

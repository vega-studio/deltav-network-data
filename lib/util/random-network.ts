import { combineSharedEdges } from "../data/combine-shared-edges";
import { makeNetwork } from "../data/make-network";
import { exclusiveRandItems } from "./random";
const randomSeed = require("random-seed");

interface IValuedObject {
  /** A name for the node. May not be unique */
  name: string;
  /** A date value on the node */
  dateMetric: Date;
  /** A numerical value on the node */
  numMetric: number;
  /** A string value on the node */
  strMetric: string;
  /** A guaranteed UID identifier */
  UID?: string | number;
}

export interface IRandomNode extends IValuedObject {}

export interface IRandomNodeWithEdge extends IValuedObject {
  /** A list of nodes this node connects to */
  siblings: (string | number)[];
}

export interface IRandomEdge extends IValuedObject {
  /** Guaranteed to point to a Node's UID */
  UID_A?: string | number;
  /** Guaranteed to point to a Node's UID */
  UID_B?: string | number;
}

function randWord(words: string[], rand: (v: number) => number) {
  return words[rand(words.length)];
}

function randPhrase(
  words: string[],
  rand: (v: number) => number,
  count: number
) {
  const out = [];

  for (let i = 0, iMax = count; i < iMax; ++i) {
    out.push(randWord(words, rand));
  }

  return out.join(" ");
}

/**
 * Generates ramdomized node data. Each node for a given index will always be
 * the same:
 *
 * genNodes(5) === genNodes(5) (deeply equals, not object pointerequals)
 *
 * also
 *
 * genNodes(5) === genNodes(15) for the first 5 nodes
 */
export function randomNodes(words: string[], count: number) {
  let NODE_UID = 0;
  const rand = randomSeed.create("nodes");
  const out: IRandomNode[] = [];

  for (let i = 0; i < count; ++i) {
    out.push({
      name: randPhrase(words, rand, 3),
      UID: ++NODE_UID,
      dateMetric: new Date(),
      numMetric: rand(1000),
      strMetric: randWord(words, rand),
    });
  }

  return out;
}

/**
 * This generates random node data that has the connection information in the
 * node data and NOT in a seperate edge data list.
 */
export function randomNodesWithEdges(
  words: string[],
  count: number,
  edgesPerNode: number
) {
  const rand = randomSeed.create("nodes-with-edges");
  const nodes: IRandomNodeWithEdge[] = this.randomNodes(words, count);

  for (let i = 0, iMax = nodes.length; i < iMax; ++i) {
    const node = nodes[i];
    const items = exclusiveRandItems(rand, nodes, edgesPerNode);
    node.siblings = items?.map((node) => node.UID || -1) || [];
  }

  return nodes;
}

/**
 * Generates randomized edge data. Each node for a given index will always be
 * the same if the input node list is the same:
 *
 * nodes = genNodes(5)
 *
 * genEdges(nodes, 5) === genEdges(nodes, 5) (deeply equals, not object pointer
 * equals)
 *
 * also
 *
 * genEdges(nodes, 5) === genEdges(nodes, 15) for the first 5 edges
 */
export function randomEdges(
  words: string[],
  nodes: IRandomNode[],
  count: number
) {
  let EDGE_UID = 0;
  const rand = randomSeed.create("edges");
  const out: IRandomEdge[] = [];

  for (let i = 0; i < count; ++i) {
    const pickTwo = exclusiveRandItems(rand, nodes, 2);
    if (!pickTwo) continue;

    out.push({
      name: randPhrase(words, rand, 3),
      UID: ++EDGE_UID,
      UID_A: pickTwo[0].UID,
      UID_B: pickTwo[1].UID,
      dateMetric: new Date(),
      numMetric: rand(1000),
      strMetric: randWord(words, rand),
    });
  }

  return out;
}

/**
 * This is a helpful method for generating a randomized network data object
 */
export async function randomNetwork(
  words: string[],
  nodeCount: number,
  edgeCount: number
) {
  const nodes = randomNodes(words, nodeCount);
  const edges = randomEdges(words, nodes, edgeCount);

  // Make a network from our randomized data
  const network = await makeNetwork({
    edgeData: edges,
    nodeData: nodes,

    nodeId: (nodeRow) => nodeRow.UID || "",
    nodeMeta: (nodeRow) => nodeRow,
    nodeValues: (nodeRow) => nodeRow.numMetric,

    edgeId: (edgeRow) => edgeRow.UID || "",
    edgeMeta: (edgeRow) => edgeRow,
    edgeA: (edgeRow) => edgeRow.UID_A || "",
    edgeB: (edgeRow) => edgeRow.UID_B || "",
    edgeValues: (edgeRow) => ({ ab: edgeRow.numMetric, ba: edgeRow.numMetric }),
  });

  // Clean up any duplicate edges
  combineSharedEdges(network, (a, _b) => a);

  return network;
}

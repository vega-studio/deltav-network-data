import assert from "assert";
import { before, describe, it } from "mocha";
import {
  getEdge,
  hasNode,
  IMakeNetworkResult,
  IRandomEdge,
  IRandomNode,
  maxWeight,
  minWeight,
  nodeWeightRange,
  randomNetwork,
  weightAtIndex,
} from "../lib";
import { WORDS } from "../test/data/word-list";

describe("Calculate", () => {
  const weight = 99;
  const weights = [12, 14, 100, -23, 120, 222, 0, 1];
  let network: IMakeNetworkResult<
    IRandomNode,
    IRandomEdge,
    IRandomNode,
    IRandomEdge
  >;
  let minW = 0;
  let maxW = 100;

  before(async () => {
    network = await randomNetwork(WORDS, 100, 1000);

    minW = network.nodes.reduce(
      (p, n) => Math.min(p, n.meta?.numMetric || Number.MAX_SAFE_INTEGER),
      Number.MAX_SAFE_INTEGER
    );
    maxW = network.nodes.reduce(
      (p, n) => Math.max(p, n.meta?.numMetric || Number.MIN_SAFE_INTEGER),
      Number.MIN_SAFE_INTEGER
    );
  });

  it("Should be the min", () => {
    assert(minWeight(weights) === -23);
  });

  it("Should be the max", () => {
    assert(maxWeight(weights) === 222);
  });

  it("Should be the weight at the index", () => {
    assert(weightAtIndex(2, weights) === 100);
  });

  it("Should be the weight at anyindex", () => {
    assert(weightAtIndex(2, weight) === 99);
    assert(weightAtIndex(5, weight) === 99);
    assert(weightAtIndex(100, weight) === 99);
    assert(weightAtIndex(-123, weight) === 99);
  });

  it("Should be the range of weights", () => {
    const range = nodeWeightRange(network);
    assert(range[0] === minW && range[1] === maxW);
  });

  it("Should retrieve an edge", async () => {
    const network = await randomNetwork(WORDS, 10, 100);
    const a = network.nodes[5];
    const b = a.in[0].a;
    let edge = getEdge(network, a, b);
    assert(edge);
    edge = getEdge(network, network.nodes[5], {
      id: 2819382,
      out: [],
      in: [],
      value: -1,
    });
    assert(!edge);
  });

  it("Should detect if the node is in the network", async () => {
    const network = await randomNetwork(WORDS, 10, 100);
    assert(hasNode(network, network.nodes));
    assert(hasNode(network, network.nodes[3]));
    assert(!hasNode(network, { id: 2819382, out: [], in: [], value: -1 }));
  });
});

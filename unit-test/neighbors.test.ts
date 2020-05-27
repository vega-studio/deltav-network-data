import assert from "assert";
import { describe, it } from "mocha";
import {
  emptyNetwork,
  FlowDirection,
  hasCircularEdge,
  IMakeNetworkResult,
  IRandomEdge,
  IRandomNode,
  randomNetwork,
  Selection,
} from "../lib";
import { WORDS } from "../test/data/word-list";

type Meta = { name: string };
type Network = IMakeNetworkResult<IRandomNode, IRandomEdge, Meta, Meta>;
const network: Network = Object.assign(emptyNetwork<Meta, Meta>(), {
  errors: null,
});

describe("Select Neighbors", () => {
  before(async () => {
    const net = await randomNetwork(
      WORDS,
      100,
      1000,
      (n) => n,
      (e) => e
    );

    // Assign the properties to our existing object so we keep the same
    // reference in the tests.
    Object.assign(network, net);
  });

  it("Should be a list", () => {
    const { nodes, edges } = Selection.neighbors({
      node: network.nodes[0],
    });

    assert(Array.isArray(nodes));
    assert(Array.isArray(edges));
  });

  it("Should be an empty list", () => {
    const { nodes, edges } = Selection.neighbors({
      node: { id: -1, in: [], out: [], value: [] },
    });

    assert(nodes.length === 0);
    assert(edges.length === 0);
  });

  it("Should be a list of all connected nodes and all edges", () => {
    const source = network.nodes.find(
      (n) => n.in.length > 0 && n.out.length > 0
    );

    assert(source);
    if (!source) return;

    const { nodes, edges, edgeToExclusion } = Selection.neighbors({
      node: source,
    });

    // If we have a circular reference, then that edge won't contribute to the
    // maximum potential neighbors a node may have
    const circularAdjustment = hasCircularEdge(source) ? 2 : 0;
    // We should have as many nodes as the source shows possible from the number
    // of edges the node has
    assert.equal(
      nodes.length,
      source.in.length + source.out.length - circularAdjustment
    );

    for (let i = 0, iMax = nodes.length; i < iMax; ++i) {
      const node = nodes[i];

      assert(
        source.in.find((edge) => edge.a === node) ||
          source.out.find((edge) => edge.b === node)
      );
    }

    for (let i = 0, iMax = edges.length; i < iMax; ++i) {
      const edge = edges[i];

      assert(
        source.in.find((e) => e === edge) || source.out.find((e) => e === edge)
      );
    }

    assert(!edgeToExclusion);
  });

  it("Should NOT include the input node", () => {
    const source = network.nodes.find(
      (n) => n.in.length > 0 && n.out.length > 0
    );

    assert(source);
    if (!source) return;

    const { nodes } = Selection.neighbors({
      node: source,
    });

    for (let i = 0, iMax = nodes.length; i < iMax; ++i) {
      const node = nodes[i];
      assert(node !== source);
    }
  });

  it("Should NOT include a node and edge", () => {
    const source = network.nodes.find(
      (n) => n.in.length > 0 && n.out.length > 0
    );

    assert(source);
    if (!source) return;

    const excludeEdge = source.out[0];
    const exclude = source.out[0].b;

    const { nodes, edges } = Selection.neighbors({
      node: source,
      exclude: new Set([exclude]),
    });

    for (let i = 0, iMax = nodes.length; i < iMax; ++i) {
      const node = nodes[i];
      assert(node !== source);
      assert(node !== exclude);
    }

    for (let i = 0, iMax = edges.length; i < iMax; ++i) {
      const edge = edges[i];
      assert(edge !== excludeEdge);
    }
  });

  it("Should be a list of outgoing nodes and edges", () => {
    // Find a node that does not have a incoming and outgoing equivalent edge
    const source = network.nodes.find(
      (n) => n.in.length > 0 && n.out.length > 0
    );

    assert(source);
    if (!source) return;

    const { nodes, edges } = Selection.neighbors({
      node: source,
      flow: FlowDirection.OUT,
    });

    for (let i = 0, iMax = nodes.length; i < iMax; ++i) {
      const node = nodes[i];

      assert(
        !source.in.find((edge) => edge.a === node) &&
          source.out.find((edge) => edge.b === node)
      );
    }

    for (let i = 0, iMax = edges.length; i < iMax; ++i) {
      const edge = edges[i];

      assert(
        !source.in.find((e) => e === edge) && source.out.find((e) => e === edge)
      );
    }
  });

  it("Should be a list of incoming nodes and edges", () => {
    // Find a node that does not have a incoming and outgoing equivalent edge
    const source = network.nodes.find(
      (n) => n.in.length > 0 && n.out.length > 0
    );

    assert(source);
    if (!source) return;

    const { nodes, edges } = Selection.neighbors({
      node: source,
      flow: FlowDirection.IN,
    });

    for (let i = 0, iMax = nodes.length; i < iMax; ++i) {
      const node = nodes[i];

      assert(
        source.in.find((edge) => edge.a === node) &&
          !source.out.find((edge) => edge.b === node)
      );
    }

    for (let i = 0, iMax = edges.length; i < iMax; ++i) {
      const edge = edges[i];

      assert(
        source.in.find((e) => e === edge) && !source.out.find((e) => e === edge)
      );
    }
  });

  it("Should exclude specified nodes and exclude edges to those nodes", () => {
    const source = network.nodes.find(
      (n) => n.in.length > 0 && n.out.length > 0
    );

    assert(source);
    if (!source) return;

    const toExclude = [source.out[0].b, source.in[0].a];
    const exclude = new Set(toExclude);
    const excludedEdges = toExclude.map(
      (n) =>
        n.in.find((edge) => edge.a === source) ||
        n.out.find((edge) => edge.b === source)
    );

    assert(excludedEdges.length === 2);

    const { nodes, edges } = Selection.neighbors({
      node: source,
      exclude,
    });

    for (let i = 0, iMax = nodes.length; i < iMax; ++i) {
      const node = nodes[i];

      assert(!exclude.has(node));
    }

    for (let i = 0, iMax = edges.length; i < iMax; ++i) {
      const edge = edges[i];

      assert(!excludedEdges.find((e) => e === edge));
    }
  });
});

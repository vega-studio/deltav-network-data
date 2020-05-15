import assert from "assert";
import { describe, it } from "mocha";
import {
  addEdge,
  addNode,
  cloneNetwork,
  getFromMapOfMaps,
  IEdge,
  IMakeNetworkResult,
  INode,
  IRandomEdge,
  IRandomNode,
  randomNetwork,
  randomNodes,
  removeEdge,
  removeNode,
} from "../lib";
import { randItem } from "../lib/util/random";
import { WORDS } from "../test/data/word-list";
const randomSeed = require("random-seed");
const rand = randomSeed.create("edit-network");

describe("Edit Network", () => {
  let network: IMakeNetworkResult<
    IRandomNode,
    IRandomEdge,
    IRandomNode,
    IRandomEdge
  >;

  before(async () => {
    network = await randomNetwork(WORDS, 100, 1000);
  });

  it("Should not have errors", () => {
    assert(!network.errors || network.errors.length <= 0);
  });

  it("Should remove node", () => {
    const net = cloneNetwork(network);
    const node = randItem(rand, net.nodes);
    const result = removeNode(net, node);

    assert(!result.errors || result.errors.size <= 0);

    // Ensure removed from node list
    let success = true;
    for (let i = 0, iMax = net.nodes.length; i < iMax; ++i) {
      const check = net.nodes[i];

      if (check === node) {
        success = false;
        break;
      }
    }

    assert(success);

    // Ensure all edges connected to the node are removed
    success = true;
    for (let i = 0, iMax = net.edges.length; i < iMax; ++i) {
      const check = net.edges[i];

      if (check.a === node || check.b === node) {
        success = false;
        break;
      }
    }

    assert(success);

    // Ensure node removed from the node map
    assert(!net.nodeMap.has(node.id));

    // We check all removed edges for some assertions as well
    const edges = Array.from(result.edges.values());
    for (let k = 0, kMax = edges.length; k < kMax; ++k) {
      const edge = edges[k];

      // Ensure all edges removed no longer exists in the list
      success = true;
      for (let i = 0, iMax = net.edges.length; i < iMax; ++i) {
        const check = net.edges[i];

        if (edge === check) {
          success = false;
          break;
        }
      }

      assert(success);

      // Ensure the edge is no longer in the edge map
      assert(!net.edgeMap.get(edge.id));
      // Ensure the atob mapping for the edge no longer exists
      assert(!getFromMapOfMaps(net.atobMap, edge.a, edge.b));
    }
  });

  it("Should remove an edge", () => {
    const net = cloneNetwork(network);
    const edge = randItem(rand, net.edges);
    const result = removeEdge(net, edge);

    assert(!result.errors || result.errors.size <= 0);

    // We check all removed edges for some assertions as well
    const edges = Array.from(result.edges.values());
    for (let k = 0, kMax = edges.length; k < kMax; ++k) {
      const edge = edges[k];

      // Ensure all edges removed no longer exists in the list
      let success = true;
      for (let i = 0, iMax = net.edges.length; i < iMax; ++i) {
        const check = net.edges[i];

        if (edge === check) {
          success = false;
          break;
        }
      }

      assert(success);

      // Ensure the edge is no longer in the edge map
      assert(!net.edgeMap.get(edge.id));
      // Ensure the atob mapping for the edge no longer exists
      assert(!getFromMapOfMaps(net.atobMap, edge.a, edge.b));
    }
  });

  it("Should add a node", () => {
    const net = cloneNetwork(network);
    const metas = randomNodes(WORDS, 1);
    const meta = metas[0];
    meta.UID = 1000;
    const node = { id: 1000, in: [], out: [], value: [], meta };
    const result = addNode(net, node);

    assert(!result.errors.nodes || result.errors.nodes.size <= 0);
    assert(!result.errors.edges || result.errors.edges.size <= 0);
    assert(result.nodes.size === 1);
    assert(result.edges.size === 0);

    // Ensure the node is listed in the network properly
    assert(net.nodes.indexOf(node) >= 0);
    assert(net.nodeMap.has(node.id));

    // Make sure the node does not exist within any edges
    for (let k = 0, kMax = net.edges.length; k < kMax; ++k) {
      const edge = net.edges[k];
      assert(edge.a !== node && edge.b !== node);
    }
  });

  it("Should add an edge", () => {
    const net = cloneNetwork(network);
    const edge = {
      id: 10000,
      a: randItem(rand, net.nodes),
      b: randItem(rand, net.nodes),
      atob: 0,
      btoa: 10,
    };
    const result = addEdge(net, edge);

    // No errors should have happened
    assert(!result.errors || result.errors.size <= 0);
    assert(result.edges.size === 1);

    // Make sure the network's lists have registered the edge
    assert(net.edges.indexOf(edge) >= 0);
    assert(net.edgeMap.has(edge.id));
    assert(getFromMapOfMaps(net.atobMap, edge.a, edge.b));

    // Make sure the end nodes for the edge have the edge added to them
    assert(edge.a.out.indexOf(edge) >= 0);
    assert(edge.b.in.indexOf(edge) >= 0);
  });

  it("Should NOT add an edge", () => {
    const net = cloneNetwork(network);
    const node: INode<IRandomNode, IRandomEdge> = {
      id: 1000,
      in: [],
      out: [],
      value: [],
    };
    const edge = {
      id: 10000,
      a: randItem(rand, net.nodes),
      b: node,
      atob: 0,
      btoa: 10,
    };
    const result = addEdge(net, edge);

    // Should have errored and have no successes
    assert(result.errors && result.errors.size === 1);
    assert(result.edges.size === 0);

    // Make sure the edge does not appear within the network ANYWHERE
    assert(net.edges.indexOf(edge) < 0);
    assert(!net.edgeMap.has(edge.id));

    for (let i = 0, iMax = net.nodes.length; i < iMax; ++i) {
      const node = net.nodes[i];
      assert(node.out.indexOf(edge) < 0);
      assert(node.in.indexOf(edge) < 0);
    }
  });

  it("Should add a node and its edges", () => {
    const net = cloneNetwork(network);
    const metas = randomNodes(WORDS, 1);
    const meta = metas[0];
    meta.UID = 1000;
    const node: INode<IRandomNode, IRandomEdge> = {
      id: 1000,
      in: [],
      out: [],
      value: [],
      meta,
    };

    const edges: IEdge<IRandomNode, IRandomEdge>[] = [
      {
        id: 1001,
        a: node,
        b: randItem(rand, net.nodes),
        atob: 10,
        btoa: 20,
      },
      {
        id: 1002,
        a: node,
        b: randItem(rand, net.nodes),
        atob: 10,
        btoa: 20,
      },
      {
        id: 1003,
        b: node,
        a: randItem(rand, net.nodes),
        atob: 10,
        btoa: 20,
      },
      {
        id: 1004,
        b: node,
        a: randItem(rand, net.nodes),
        atob: 10,
        btoa: 20,
      },
      // This edge should error as it's b references something not within the
      // network
      {
        id: 1005,
        a: node,
        b: { id: 2000, in: [], out: [], value: [], meta },
        atob: 10,
        btoa: 20,
      },
    ];

    node.out = edges;

    const result = addNode(net, node);

    // We should have 1 edge that errored
    assert(result.errors.edges && result.errors.edges.size === 1);
    assert(result.nodes.size === 1);
    assert(result.edges.size === 4);

    // Ensure the node is listed in the network properly
    assert(net.nodes.indexOf(node) >= 0);
    assert(net.nodeMap.has(node.id));

    // Make sure the node only exists within the edges added
    for (let k = 0, kMax = net.edges.length; k < kMax; ++k) {
      const edge = net.edges[k];

      if (edge.a === node || edge.b === node) {
        assert(edges.indexOf(edge) > -1);
      }
    }
  });
});

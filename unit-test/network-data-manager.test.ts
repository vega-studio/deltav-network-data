import assert from "assert";
import { before, describe, it } from "mocha";
import {
  cloneNetwork,
  cloneNode,
  emptyNetwork,
  IEdge,
  IMakeNetworkResult,
  INode,
  IRandomEdge,
  IRandomNode,
  NetworkDataManager,
  randomNetwork,
} from "../lib";
import { WORDS } from "../test/data/word-list";

type Meta = { name: string };
type Network = IMakeNetworkResult<IRandomNode, IRandomEdge, Meta, Meta>;

const network: Network = Object.assign(emptyNetwork<Meta, Meta>(), {
  errors: null,
});

describe("Network Data Manager", () => {
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

  it("Should broadcast an added node", async () => {
    const net = cloneNetwork(network);

    let pass = false;
    let passError = true;

    const manager = new NetworkDataManager({
      data: net,
      onAddNodes: (nodes) => {
        pass = nodes.size > 0;
      },
      onNodeErrors: () => {
        passError = false;
      },
    });

    manager.addNode({
      id: 9999,
      in: [],
      out: [],
      value: 10,
    });

    assert(passError);
    assert(pass);
  });

  it("Should broadcast a removed node", async () => {
    const net = cloneNetwork(network);

    let pass = false;
    let passEdges = false;
    let passError = true;

    const manager = new NetworkDataManager({
      data: net,
      onRemoveNodes: (nodes) => {
        pass = nodes.size > 0;
      },
      onRemoveEdges: (edges) => {
        passEdges = edges.size > 0;
      },
      onNodeErrors: () => {
        passError = false;
      },
    });

    manager.removeNode(net.nodes[0]);

    assert(passError);
    assert(pass);
    assert(passEdges);
  });

  it("Should broadcast an added edge", async () => {
    const net = cloneNetwork(network);

    let pass = false;
    let passNodes = true;
    let passError = true;

    const manager = new NetworkDataManager({
      data: net,
      onAddNodes: () => {
        passNodes = false;
      },
      onAddEdges: (edges) => {
        pass = edges.size > 0;
      },
      onEdgeErrors: () => {
        passError = false;
      },
    });

    manager.addEdge({
      id: 9999,
      a: net.nodes[0],
      b: net.nodes[1],
      atob: 10,
      btoa: 100,
    });

    assert(passError);
    assert(pass);
    assert(passNodes);
  });

  it("Should broadcast an error for an added edge", async () => {
    const net = cloneNetwork(network);

    let pass = true;
    let passError = true;

    const manager = new NetworkDataManager({
      data: net,
      onAddEdges: () => {
        pass = false;
      },
      onEdgeErrors: (edges) => {
        passError = edges.size === 1;
      },
    });

    manager.addEdge({
      id: 9999,
      a: cloneNode(network.nodes[0]),
      b: network.nodes[1],
      atob: 10,
      btoa: 100,
    });

    assert(passError);
    assert(pass);
  });

  it("Should broadcast a removed edge", async () => {
    const net = cloneNetwork(network);

    let pass = false;
    let passError = true;

    const manager = new NetworkDataManager({
      data: net,
      onRemoveEdges: (edges) => {
        pass = edges.size > 0;
      },
      onEdgeErrors: () => {
        passError = false;
      },
    });

    manager.removeEdge(net.edges[0]);

    assert(passError);
    assert(pass);
  });

  it("Should broadcast an added node and it's edges", async () => {
    const net = cloneNetwork(network);

    let pass = false;
    let passEdges = false;
    let passError = true;

    const manager = new NetworkDataManager({
      data: net,
      onAddNodes: (nodes) => {
        pass = nodes.size === 1;
      },
      onAddEdges: (edges) => {
        passEdges = edges.size === 4;
      },
      onNodeErrors: () => {
        passError = false;
      },
    });

    const node: INode<Meta, Meta> = {
      id: 9999,
      in: [],
      out: [],
      value: 10,
    };

    node.in = [
      {
        id: 10000,
        a: net.nodes[0],
        b: node,
        atob: 10,
        btoa: 100,
        meta: { name: "" },
      },
      {
        id: 10001,
        a: net.nodes[1],
        b: node,
        atob: 10,
        btoa: 100,
        meta: { name: "" },
      },
    ];

    node.out = [
      {
        id: 10002,
        b: net.nodes[2],
        a: node,
        atob: 10,
        btoa: 100,
        meta: { name: "" },
      },
      {
        id: 10003,
        b: net.nodes[3],
        a: node,
        atob: 10,
        btoa: 100,
        meta: { name: "" },
      },
    ];

    manager.addNode(node);

    assert(passError);
    assert(pass);
    assert(passEdges);
  });

  it("Should broadcast multiple added nodes", async () => {
    const net = cloneNetwork(network);

    let pass = false;
    let passEdges = true;
    let passError = true;

    const manager = new NetworkDataManager({
      data: net,
      debounce: 1,
      onAddNodes: (nodes) => {
        pass = nodes.size === 3;
      },
      onAddEdges: () => {
        passEdges = false;
      },
      onNodeErrors: () => {
        passError = false;
      },
    });

    manager.addNode({
      id: 9999,
      in: [],
      out: [],
      value: 10,
    });

    manager.addNode({
      id: 10000,
      in: [],
      out: [],
      value: 10,
    });

    manager.addNode({
      id: 10001,
      in: [],
      out: [],
      value: 10,
    });

    await manager.finished;

    assert(passError);
    assert(pass);
    assert(passEdges);
  });

  it("Should broadcast multiple added nodes and edges", async () => {
    const net = cloneNetwork(network);

    let pass = false;
    let passEdges = false;
    let passError = true;

    const manager = new NetworkDataManager({
      data: net,
      debounce: 1,
      onAddNodes: (nodes) => {
        pass = nodes.size === 3;
      },
      onAddEdges: (edges) => {
        passEdges = edges.size === 4;
      },
      onNodeErrors: () => {
        passError = false;
      },
    });

    let node: INode<Meta, Meta> = {
      id: 9999,
      in: [],
      out: [],
      value: 10,
    };

    node.in = [
      {
        id: 10000,
        a: net.nodes[0],
        b: node,
        atob: 10,
        btoa: 100,
        meta: { name: "" },
      },
      {
        id: 10001,
        a: net.nodes[1],
        b: node,
        atob: 10,
        btoa: 100,
        meta: { name: "" },
      },
    ];

    manager.addNode(node);

    node = {
      id: 10000,
      in: [],
      out: [],
      value: 10,
    };

    node.out = [
      {
        id: 10002,
        b: net.nodes[2],
        a: node,
        atob: 10,
        btoa: 100,
        meta: { name: "" },
      },
      {
        id: 10003,
        b: net.nodes[3],
        a: node,
        atob: 10,
        btoa: 100,
        meta: { name: "" },
      },
    ];

    manager.addNode({
      id: 10001,
      in: [],
      out: [],
      value: 10,
    });

    manager.addNode(node);

    await manager.finished;

    assert(passError);
    assert(pass);
    assert(passEdges);
  });

  it("Should not broadcast an added node", async () => {
    const net = cloneNetwork(network);

    let pass = true;
    let passError = true;

    const manager = new NetworkDataManager({
      data: net,
      debounce: 1,
      onAddNodes: () => {
        pass = false;
      },
      onNodeErrors: () => {
        passError = false;
      },
    });

    const node: INode<Meta, Meta> = {
      id: 9999,
      in: [],
      out: [],
      value: 10,
    };

    manager.addNode(node);
    manager.removeNode(node);

    await manager.finished;

    assert(passError);
    assert(pass);
  });

  it("Should not broadcast an added edge", async () => {
    const net = cloneNetwork(network);

    let pass = true;
    let passError = true;

    const manager = new NetworkDataManager({
      data: net,
      debounce: 1,
      onAddEdges: () => {
        pass = false;
      },
      onEdgeErrors: () => {
        passError = false;
      },
    });

    const edge: IEdge<Meta, Meta> = {
      id: 9999,
      a: net.nodes[0],
      b: net.nodes[1],
      atob: 10,
      btoa: 100,
    };

    manager.addEdge(edge);
    manager.removeEdge(edge);

    await manager.finished;

    assert(passError);
    assert(pass);
  });

  it("Should broadcast multiple added nodes and edges but not one", async () => {
    const net = cloneNetwork(network);

    let pass = false;
    let passEdges = false;
    let passError = true;

    const manager = new NetworkDataManager({
      data: net,
      debounce: 1,
      onAddNodes: (nodes) => {
        pass = nodes.size === 2;
      },
      onAddEdges: (edges) => {
        passEdges = edges.size === 1;
      },
      onNodeErrors: () => {
        passError = false;
      },
    });

    let node: INode<Meta, Meta> = {
      id: 9999,
      in: [],
      out: [],
      value: 10,
    };

    node.in = [
      {
        id: 10000,
        a: net.nodes[0],
        b: node,
        atob: 10,
        btoa: 100,
        meta: { name: "" },
      },
      {
        id: 10001,
        a: net.nodes[1],
        b: node,
        atob: 10,
        btoa: 100,
        meta: { name: "" },
      },
    ];

    manager.addNode(node);

    node = {
      id: 10000,
      in: [],
      out: [],
      value: 10,
    };

    node.out = [
      {
        id: 10002,
        b: net.nodes[2],
        a: node,
        atob: 10,
        btoa: 100,
        meta: { name: "" },
      },
      {
        id: 10003,
        b: net.nodes[3],
        a: node,
        atob: 10,
        btoa: 100,
        meta: { name: "" },
      },
    ];

    manager.addNode(node);

    manager.addNode({
      id: 10001,
      in: [],
      out: [],
      value: 10,
    });

    manager.removeNode(node);
    const edge = net.edgeMap.get(10000);
    if (edge) manager.removeEdge(edge);

    await manager.finished;

    assert(passError);
    assert(pass);
    assert(passEdges);
  });
});

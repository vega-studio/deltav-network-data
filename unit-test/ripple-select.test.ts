import assert from "assert";
import { describe, it } from "mocha";
import {
  emptyNetwork,
  IEdge,
  IMakeNetworkResult,
  IRandomEdge,
  IRandomNode,
  randomNetwork,
  RippleSelect,
} from "../lib";
import { WORDS } from "../test/data/word-list";

type Meta = { name: string };
type Network = IMakeNetworkResult<IRandomNode, IRandomEdge, Meta, Meta>;
const network: Network = Object.assign(emptyNetwork<Meta, Meta>(), {
  errors: null,
});

describe("Ripple Select", () => {
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

  const ripple = new RippleSelect();

  it("Should select ALL nodes with no duplicates", async () => {
    const start = network.nodes[0];
    const all = new Set();

    await ripple.splash(
      {
        startNodes: start,
      },
      async (result) => {
        result.nodes.forEach((n) => {
          assert(!all.has(n));
          all.add(n);
        });
      }
    );

    assert.equal(
      all.size,
      network.nodes.length,
      "Must produce all of the nodes"
    );
  });

  it("Should select ALL edges", async () => {
    const start = network.nodes[0];
    const all = new Set();

    await ripple.splash(
      {
        startNodes: start,
      },
      async (result) => {
        result.edges.forEach((e) => {
          all.add(e);
        });
      }
    );

    assert.equal(
      all.size,
      network.edges.length,
      "Must produce all of the edges"
    );
  });

  it("Should HAVE edges to nodes with the same depth", async () => {
    const start = network.nodes[0];
    const nodeToDepth = new Map();
    const allEdges = new Set<IEdge<Meta, Meta>>();

    await ripple.splash(
      {
        startNodes: start,
      },
      async (result) => {
        result.nodes.forEach((n) => {
          nodeToDepth.set(n, result.depth);
        });

        result.edges.forEach((e) => {
          allEdges.add(e);
        });
      }
    );

    let sameDepthCount = 0;
    allEdges.forEach((e) => {
      sameDepthCount += nodeToDepth.get(e.a) === nodeToDepth.get(e.b) ? 1 : 0;
    });

    assert(sameDepthCount > 0);
  });

  it("Should have NO edges to nodes with the same depth", async () => {
    const start = network.nodes[0];
    const nodeToDepth = new Map();
    const allEdges = new Set<IEdge<Meta, Meta>>();

    await ripple.splash(
      {
        startNodes: start,
        excludeSameDepthEdges: true,
      },
      async (result) => {
        result.nodes.forEach((n) => {
          nodeToDepth.set(n, result.depth);
        });

        result.edges.forEach((e) => {
          allEdges.add(e);
        });
      }
    );

    allEdges.forEach((e) => {
      assert(nodeToDepth.get(e.a) !== nodeToDepth.get(e.b));
    });
  });

  it("Should provide a path to get back to the source", async () => {
    const start = network.nodes[0];
    let pass = "";

    await ripple.splash(
      {
        startNodes: start,
        includePath: true,
      },
      async (result) => {
        if (!result.path) {
          pass = "No parent provided in results";
          return;
        }

        const getParent = result.path;

        result.nodes.forEach((n) => {
          let next: any = n;
          let current = n;

          while (next) {
            current = next;
            next = getParent.get(next);
          }

          if (current !== start) {
            pass = "Tracing the node back did not result in the source";
          }
        });
      }
    );

    assert.equal(pass, "");
  });

  it("Should provide a lookup to find the splash node for the resulting node", async () => {
    const start = network.nodes[0];
    let pass = "";

    await ripple.splash(
      {
        startNodes: start,
        includeSource: true,
      },
      async (result) => {
        if (!result.source) {
          pass = "No source lookup provided in results";
          return;
        }

        const getSource = result.source;

        result.nodes.forEach((n) => {
          if (getSource.get(n) !== start) {
            pass = "The node did not have a reference back to it's source";
          }
        });
      }
    );

    assert.equal(pass, "");
  });

  it("Should propagate to a wave depth of 2", async () => {
    const start = network.nodes[0];
    let pass = "";

    await ripple.splash(
      {
        startNodes: start,
        maxDepth: 2,
      },
      async (result) => {
        if (result.depth > 2) {
          pass = `Found a wave depth of ${result.depth}`;
        }

        if (result.depth < 2) {
          pass = `Only hit a depth of ${result.depth}`;
        }

        if (result.depth === 2) {
          pass = "";
        }
      }
    );

    assert.equal(pass, "");
  });

  it("Should have at least one collision", async () => {
    const startA = network.nodes[0];
    const startB = network.nodes[network.nodes.length - 1];
    let pass = false;

    await ripple.splash(
      {
        startNodes: [startA, startB],
        includeCollisions: true,
      },
      async (result) => {
        if (result.nodeCollisions && result.nodeCollisions.size > 0) {
          pass = true;
        }

        if (result.edgeCollisions && result.edgeCollisions.size > 0) {
          pass = true;
        }
      }
    );

    assert(pass);
  });
});

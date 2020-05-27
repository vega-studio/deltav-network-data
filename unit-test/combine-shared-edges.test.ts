import assert from "assert";
import { describe, it } from "mocha";
import {
  addToMapOfMaps,
  emptyNetwork,
  getFromMapOfMaps,
  IMakeNetworkResult,
  IRandomEdge,
  IRandomNode,
  randomNetwork,
} from "../lib";
import { WORDS } from "../test/data/word-list";

// const nodes = randomNodes(WORDS, 100);
// const edges = randomEdges(WORDS, nodes, 1000);
type Meta = { name: string };
type Network = IMakeNetworkResult<IRandomNode, IRandomEdge, Meta, Meta>;
const network: Network = Object.assign(emptyNetwork<Meta, Meta>(), {
  errors: null,
});

describe("Combine shared edges", () => {
  before(async () => {
    // Creating a random network like this runs the combine shared egdes method
    // so we can check to see if the operation ran correctly.
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

  it("Should have no two edges that point to the same two nodes", () => {
    const edges = new Map<any, any>();

    // Map check method
    for (let i = 0, iMax = network.edges.length; i < iMax; ++i) {
      const edge = network.edges[i];

      assert(
        !getFromMapOfMaps(edges, edge.a, edge.b) &&
          !getFromMapOfMaps(edges, edge.b, edge.a)
      );

      addToMapOfMaps(edges, edge.a, edge.b, edge);
    }

    // Hard check method
    network.edges.forEach((edge) => {
      const duplicate = network.edges.find(
        (check) =>
          (check !== edge && check.a === edge.a && check.b === edge.b) ||
          (check !== edge && check.a === edge.b && check.b === edge.a)
      );

      assert(!duplicate);
    });
  });

  it("Should have no node with an 'in' that matches an 'out' except for circular references", () => {
    network.nodes.forEach((node) => {
      assert(
        !node.in.find((edgeIn) =>
          node.out.find(
            (edgeOut) =>
              edgeIn.a !== edgeIn.b &&
              edgeIn.a === edgeOut.b &&
              edgeIn.b === edgeOut.a
          )
        )
      );
    });
  });
});

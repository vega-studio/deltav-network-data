import assert from "assert";
import { describe, it } from "mocha";
import {
  combineSharedEdges,
  convertNetwork,
  IMakeNetworkResult,
  isNodePair,
  NodePair,
} from "../lib";

interface IDataNode {
  title?: string;
  children?: IDataNode[];
  "edit-time"?: number;
  "edit-email"?: string;
  string?: string;
  "create-email"?: string;
  "create-time"?: number;
  uid?: string;
  heading?: string;
}

const data: IDataNode[] = require("../test/data/network.json");
const flattenedData: IDataNode[] = [];

function flatten(nodes: IDataNode[], out: IDataNode[]) {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node) continue;
    out.push(node);
    if (node.children) flatten(node.children, out);
  }
}

flatten(data, flattenedData);

describe("Convert Network", () => {
  let network: IMakeNetworkResult<
    IDataNode,
    NodePair<IDataNode>,
    IDataNode,
    NodePair<IDataNode>
  >;

  before(async () => {
    // The top level nodes have a discrepancy where they have no formal UIDs, so
    // we provide the top level with an identifier consisting of it's index and
    // title.
    data.forEach((top, i) => {
      top.uid = `${i}:${top.title || "No Title"}`;
    });

    network = await convertNetwork<
      IDataNode,
      NodePair<IDataNode>,
      IDataNode,
      NodePair<IDataNode>,
      never,
      never
    >({
      data,

      // Extract the node related information of the network
      nodes: (node: IDataNode) => node.children || [],
      nodeA: (edgeSource) => edgeSource.a,
      nodeB: (edgeSource) => edgeSource.b,
      nodeId: (node) => node.uid || node.title || "",
      nodeValue: () => 1,
      nodeMeta: (node) => node,

      // Extract the edge related information
      edges: (source) =>
        isNodePair(source) ? { ab: [source], ba: [] } : { ab: [], ba: [] },
      edgeA: (source) => source.a.uid || source.a.title || "",
      edgeB: (source) => source.b.uid || source.b.title || "",
      edgeMeta: (source) => source,
      edgeValues: () => ({ ab: [0], ba: [0] }),
    });

    // Clean up duplicate connections
    combineSharedEdges(network, (edgeA) => edgeA);
  });

  it("Should make a network", () => {
    assert(network);
  });

  it("Should have every node", () => {
    let success = true;

    for (let i = 0, iMax = flattenedData.length; i < iMax; ++i) {
      const node = flattenedData[i];
      if (!network.nodeMap.has(node.uid as any)) {
        success = false;
        break;
      }
    }

    assert.equal(
      network.nodes.length,
      flattenedData.length,
      "Must have the same number of nodes in the original data"
    );
    assert(success);
  });

  it("Should have matching hierarchy", () => {
    for (let i = 0, iMax = flattenedData.length; i < iMax; ++i) {
      const nodeA = flattenedData[i];
      const nodeB = network.nodeMap.get(nodeA.uid as any);

      if (!nodeB) {
        assert(nodeB);
        return;
      }

      assert.equal(
        (nodeA.children || []).length,
        nodeB.out.length,
        "Both nodes MUST have equal children"
      );
    }
  });
});

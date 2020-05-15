import assert from 'assert';
import { before, describe, it } from 'mocha';
import {
  cloneNetwork,
  compareEdges,
  compareNetworks,
  compareNodes,
  emptyNetwork,
  getFromMapOfMaps,
  IMakeNetworkResult,
  IRandomEdge,
  IRandomNode,
  randomEdges,
  randomNetwork,
  randomNodes
} from '../lib';
import { WORDS } from '../test/data/word-list';

const nodes = randomNodes(WORDS, 100);
const edges = randomEdges(WORDS, nodes, 1000);
type Meta = { name: string };
type Network = IMakeNetworkResult<IRandomNode, IRandomEdge, Meta, Meta>;

const network: Network = Object.assign(
  emptyNetwork<Meta, Meta>(),
  { errors: null }
);

const clone: Network = Object.assign(
  emptyNetwork<Meta, Meta>(),
  { errors: null }
);

const shouldNotHaveErrors = (network: Network) => () => {
  assert(!network.errors || network.errors.length <= 0);
};

const shouldHaveARowForEveryNode = (network: Network) => () => {
  let success = true;
  for (let i = 0, iMax = network.nodes.length; i < iMax; ++i) {
    const node = network.nodes[i];
    if (!nodes.find(row => (row.UID === node.id))) {
      success = false;
      break;
    }
  }

  assert(success);
};

const shouldHaveARowForEveryEdge = (network: Network) => () => {
  let success = true;
  for (let i = 0, iMax = network.edges.length; i < iMax; ++i) {
    const edge = network.edges[i];
    if (!edges.find(row => (row.UID === edge.id))) {
      success = false;
      break;
    }
  }

  assert(success);
};

const shouldHaveAMappingForEveryNodeId = (network: Network) => () => {
  let success = true;
  for (let i = 0, iMax = network.nodes.length; i < iMax; ++i) {
    const node = network.nodes[i];
    if (!network.nodeMap.has(node.id)) {
      success = false;
      break;
    }
  }

  assert(success);
};

const shouldHaveAMappingForEveryEdgeId = (network: Network) => () => {
  let success = true;
  for (let i = 0, iMax = network.edges.length; i < iMax; ++i) {
    const edge = network.edges[i];
    if (!network.edgeMap.has(edge.id)) {
      success = false;
      break;
    }
  }

  assert(success);
};

const shouldHaveAnAtoBForEveryEdge = (network: Network) => () => {
  let success = true;
  for (let i = 0, iMax = network.edges.length; i < iMax; ++i) {
    const edge = network.edges[i];
    if (!getFromMapOfMaps(network.atobMap, edge.a, edge.b)) {
      success = false;
      break;
    }
  }

  assert(success);
};

const shouldNotHaveAnBtoAForEveryEdge = (network: Network) => () => {
  let success = true;
  for (let i = 0, iMax = network.edges.length; i < iMax; ++i) {
    const edge = network.edges[i];
    if (getFromMapOfMaps(network.atobMap, edge.b, edge.a) && edge.a !== edge.b) {
      success = false;
      break;
    }
  }

  assert(success);
};

const shouldNotHaveDuplicateNodeReference = (network: Network) => () => {
  let success = true;
  for (let i = 0, iMax = network.nodes.length; i < iMax; ++i) {
    const node = network.nodes[i];
    let found = 0;

    for (let k = 0, kMax = network.nodes.length; k < kMax; ++k) {
      const node2 = network.nodes[k];
      if (node === node2) {
        found++;

        if (found > 1) {
          success = false;
          break;
        }
      }
    }
  }

  assert(success);
};

const shouldNotHaveDuplicateNodeIdentifiers = (network: Network) => () => {
  let success = true;
  for (let i = 0, iMax = network.nodes.length; i < iMax; ++i) {
    const node = network.nodes[i];
    let found = 0;

    for (let k = 0, kMax = network.nodes.length; k < kMax; ++k) {
      const node2 = network.nodes[k];
      if (node.id === node2.id) {
        found++;

        if (found > 1) {
          success = false;
          break;
        }
      }
    }
  }

  assert(success);
};

const shouldShareTheSameNodeObjectReference = (network: Network) => () => {
  let success = true;
  for (let i = 0, iMax = network.nodes.length; i < iMax; ++i) {
    const node = network.nodes[i];
    if (network.nodeMap.get(node.id) !== node) {
      success = false;
      break;
    }
  }

  assert(success);
};

const shouldNotHaveDuplicateEdgeReference = (network: Network) => () => {
  let success = true;
  for (let i = 0, iMax = network.edges.length; i < iMax; ++i) {
    const edge = network.edges[i];
    let found = 0;

    for (let k = 0, kMax = network.edges.length; k < kMax; ++k) {
      const edge2 = network.edges[k];
      if (edge === edge2) {
        found++;

        if (found > 1) {
          success = false;
          break;
        }
      }
    }
  }

  assert(success);
};

const shouldNotHaveDuplicateEdgeIdentifiers = (network: Network) => () => {
  let success = true;
  for (let i = 0, iMax = network.edges.length; i < iMax; ++i) {
    const edge = network.edges[i];
    let found = 0;

    for (let k = 0, kMax = network.edges.length; k < kMax; ++k) {
      const edge2 = network.edges[k];
      if (edge.id === edge2.id) {
        found++;

        if (found > 1) {
          success = false;
          break;
        }
      }
    }
  }

  assert(success);
};

const shouldShareTheSameEdgeObjectReference = (network: Network) => () => {
  let success = true;
  for (let i = 0, iMax = network.edges.length; i < iMax; ++i) {
    const edge = network.edges[i];
    if (network.edgeMap.get(edge.id) !== edge) {
      success = false;
      break;
    }
  }

  assert(success);
};

const shouldHaveValidNodeReferencesAndIdentifiers = (network: Network) => () => {
  let success = true;
  for (let i = 0, iMax = network.edges.length; i < iMax; ++i) {
    const edge = network.edges[i];

    if (network.nodeMap.get(edge.a.id) !== edge.a) {
      success = false;
      break;
    }

    if (network.nodeMap.get(edge.b.id) !== edge.b) {
      success = false;
      break;
    }
  }

  assert(success);
};

describe('Make Network', () => {
  before(async () => {
    const net = await randomNetwork(WORDS, 100, 1000);

    // Assign the properties to our existing object so we keep the same reference in the tests
    Object.assign(
      network,
      net
    );
  });

  it ('Should not have errors', shouldNotHaveErrors(network));
  it ('Should have a row for every node', shouldHaveARowForEveryNode(network));
  it ('Should have a row for every edge', shouldHaveARowForEveryEdge(network));
  it ('Should have a mapping for every node id', shouldHaveAMappingForEveryNodeId(network));
  it ('Should have a mapping for every edge id', shouldHaveAMappingForEveryEdgeId(network));
  it ('Should have an a to b for every edge', shouldHaveAnAtoBForEveryEdge(network));
  it ('Should NOT have an b to a for every edge (Unless a === b)', shouldNotHaveAnBtoAForEveryEdge(network));
  it ('Should NOT have duplicate node references', shouldNotHaveDuplicateNodeReference(network));
  it ('Should NOT have duplicate node identifiers', shouldNotHaveDuplicateNodeIdentifiers(network));
  it ('Should share the same node object reference', shouldShareTheSameNodeObjectReference(network));
  it ('Should NOT have duplicate edge references', shouldNotHaveDuplicateEdgeReference(network));
  it ('Should NOT have duplicate edge identifiers', shouldNotHaveDuplicateEdgeIdentifiers(network));
  it ('Should share the same edge object reference', shouldShareTheSameEdgeObjectReference(network));
  it ('Should have valid node references and identifiers', shouldHaveValidNodeReferencesAndIdentifiers(network));
});

describe('Clone Network', () => {
  before(async () => {
    const net = cloneNetwork(network);
    // Assign the properties to our existing object so we keep the same reference in the tests
    Object.assign(
      clone,
      net
    );
  });

  it ('Should not have errors', shouldNotHaveErrors(clone));
  it ('Should have a row for every node', shouldHaveARowForEveryNode(clone));
  it ('Should have a row for every edge', shouldHaveARowForEveryEdge(clone));
  it ('Should have a mapping for every node id', shouldHaveAMappingForEveryNodeId(clone));
  it ('Should have a mapping for every edge id', shouldHaveAMappingForEveryEdgeId(clone));
  it ('Should have an a to b for every edge', shouldHaveAnAtoBForEveryEdge(clone));
  it ('Should NOT have an b to a for every edge (Unless a === b)', shouldNotHaveAnBtoAForEveryEdge(clone));
  it ('Should NOT have duplicate node references', shouldNotHaveDuplicateNodeReference(clone));
  it ('Should NOT have duplicate node identifiers', shouldNotHaveDuplicateNodeIdentifiers(clone));
  it ('Should share the same node object reference', shouldShareTheSameNodeObjectReference(clone));
  it ('Should NOT have duplicate edge references', shouldNotHaveDuplicateEdgeReference(clone));
  it ('Should NOT have duplicate edge identifiers', shouldNotHaveDuplicateEdgeIdentifiers(clone));
  it ('Should share the same edge object reference', shouldShareTheSameEdgeObjectReference(clone));
  it ('Should have valid node references and identifiers', shouldHaveValidNodeReferencesAndIdentifiers(clone));

  it ('Should not share any references', () => {
    let success = true;
    for (let i = 0, iMax = clone.nodes.length; i < iMax; ++i) {
      const node = clone.nodes[i];
      const check = network.nodes[i];

      if (network.nodeMap.get(node.id) === node || node === check) {
        success = false;
        break;
      }
    }

    assert(success);

    success = true;
    for (let i = 0, iMax = clone.edges.length; i < iMax; ++i) {
      const edge = clone.edges[i];
      const check = network.edges[i];

      if (network.edgeMap.get(edge.id) === edge || check === edge) {
        success = false;
        break;
      }
    }

    assert(success);
  });

  it('Should have equal nodes', () => {
    let success = true;
    assert(clone.nodes.length === network.nodes.length);

    for (let i = 0, iMax = clone.nodes.length; i < iMax; ++i) {
      const nodeA = clone.nodes[i];
      const nodeB = network.nodes[i];

      if (!compareNodes(nodeA, nodeB)) {
        success = false;
        break;
      }
    }

    assert(success);
  });

  it('Should have equal edges', () => {
    let success = true;
    assert(clone.edges.length === network.edges.length);

    for (let i = 0, iMax = clone.edges.length; i < iMax; ++i) {
      const edgeA = clone.edges[i];
      const edgeB = network.edges[i];

      if (!compareEdges(edgeA, edgeB)) {
        success = false;
        break;
      }
    }

    assert(success);
  });

  it ('Should be equivalent networks', () => {
    assert(compareNetworks(clone, network));
  });
});

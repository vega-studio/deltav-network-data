import { DataProvider, values } from "simple-data-provider";
import {
  Accessor,
  Identifier,
  IEdge,
  IMakeNetworkError,
  IMakeNetworkResult,
  INetworkData,
  INode,
  isDefined,
  isEdgeWeights,
  isIdentifier,
  isWeights,
  MakeNetworkErrorType,
  Weights,
} from "../types";
import { addToMapOfMaps, makeList, removeFromMapOfMaps } from "../util";
import { access } from "../util/access";
import { makeError } from "../util/make-error";

export type NodePair<TNode> = { a: TNode; b: TNode };
export type EdgeFlow<TEdge> = { ab: TEdge[]; ba: TEdge[] };
export type EdgeValues = { ab?: Weights; ba?: Weights } | undefined;

function isEdgeFlow<TEdge>(val: any): val is EdgeFlow<TEdge> {
  return val && val.a && val.b && Array.isArray(val.a) && Array.isArray(val.b);
}

export function isNodePair<TNode>(val: any): val is NodePair<TNode> {
  return val && val.a && val.b;
}

export interface IConvertNetworkOptions<
  TNodeSource,
  TEdgeSource,
  TNodeMeta,
  TEdgeMeta,
  TNodeInfo,
  TEdgeInfo
> {
  /**
   * This is the data that will be traversed for conversion. Each node is
   * expected to connect to other nodes by means of an edge or connect directly
   * to a node of a same type.
   */
  data: DataProvider<TNodeSource>;

  /**
   * This specifies how to find the children of the provided object. The
   * children should be another TNode type. If the node does not reference
   * children directly via reference but via a linking object (like an edge)
   * then make sure you specify the "edge" accessor. Edges will also be passed
   * into this object to find the nodes of the edge
   */
  nodes: Accessor<TNodeSource, TNodeSource[], TNodeInfo>;

  /**
   * Retrieves the NodeSource associated with the A connection of an EdgeSource
   */
  nodeA: Accessor<TEdgeSource, TNodeSource, never>;

  /**
   * Retrieves the NodeSource associated with the B connection of an EdgeSource
   */
  nodeB: Accessor<TEdgeSource, TNodeSource, never>;

  /**
   * Accessor to provide the identifier for the node currently in use.
   *
   * You can return multiple identifiers for a single node of data to split the
   * node being processed into multiple nodes for the Network Data being
   * generated.
   */
  nodeId: Accessor<TNodeSource, Identifier | Identifier[], never>;

  /**
   * This retrieves info from a node source that is related to the provided
   * identifier. All Accessors related to nodes will be passed this information
   * so they can make more informed decisions on their data access.
   */
  nodeInfo?(id: Identifier, idIndex: number, data: TNodeSource): TNodeInfo;

  /**
   * This accessor retrieves any meta information from a node you wish to store
   * with the node.
   */
  nodeMeta?: Accessor<TNodeSource, TNodeMeta, TNodeInfo>;

  /**
   * This accessor retrieves the values associated with the node.
   */
  nodeValue: Accessor<TNodeSource, Weights, TNodeInfo>;

  /**
   * This specifies how to find edge type objects that are linked to this node.
   * Simply return all edge style objects the node may have. The edge will then
   * be processed for it's nodes in the nodes accessor.
   *
   * If this passes in a single node, then you should return all known edges
   * that represent outgoing (a to b) and incoming edges (b to a). If each node
   * only knows outgoing or only incoming edges it is valid to leave ab or ba
   * blank.
   *
   * If this passes in a node pair {a, b} the pair indicates the directionaly it
   * expects with one node keyed as 'a' and one as 'b' for you.
   */
  edges: Accessor<
    TNodeSource | NodePair<TNodeSource>,
    { ab: TEdgeSource[]; ba: TEdgeSource[] },
    TEdgeInfo
  >;

  /**
   * Accessor to provide the identifier for the edge. Edges arise from either
   * a specific edge object, or the edge arises from two nodes linked directly
   * together.
   */
  edgeId?: Accessor<TEdgeSource, Identifier | Identifier[], never>;

  /**
   * This retrieves info from an edge source that is related to the provided
   * identifier. All Accessors related to edges will be passed this information
   * so they can make more informed decisions on their data access.
   */
  edgeInfo?(id: Identifier, idIndex: number, data: TEdgeSource): TEdgeInfo;

  /**
   * Accessor to provide the node the edge emits from. Edges flow from A -> B
   */
  edgeA: Accessor<TEdgeSource, Identifier, TEdgeInfo>;

  /**
   * Accessor to provide the node the edge emits from. Edges flow from A -> B
   */
  edgeB: Accessor<TEdgeSource, Identifier, TEdgeInfo>;

  /**
   * This retrieves any meta information from a node you wish to store with the
   * edge.
   */
  edgeMeta?: Accessor<TEdgeSource, TEdgeMeta, TEdgeInfo>;

  /**
   * This accessor produces the values an edge will represent from a to b and
   * b to a.
   */
  edgeValues?: Accessor<TEdgeSource, EdgeValues, TEdgeInfo>;

  /**
   * Supply this with a list of errors you wish to ignore. For instance, in some
   * cases, it may be necessary to have node's with duplicate identifiers.
   */
  suppressErrors?: MakeNetworkErrorType[];
}

/**
 * The goal of this method is to take a pre-existing network style of
 * information (Objects with references to other objects to form a network))
 * and convert it into the common format of INetworkData
 */
export async function convertNetwork<
  TNodeSource,
  TEdgeSource,
  TNodeMeta,
  TEdgeMeta,
  TNodeInfo,
  TEdgeInfo
>(
  options: IConvertNetworkOptions<
    TNodeSource,
    TEdgeSource,
    TNodeMeta,
    TEdgeMeta,
    TNodeInfo,
    TEdgeInfo
  >
): Promise<IMakeNetworkResult<TNodeSource, TEdgeSource, TNodeMeta, TEdgeMeta>> {
  const {
    data,
    nodes: getNodes,
    nodeA: getNodeA,
    nodeB: getNodeB,
    nodeId: getNodeId,
    nodeInfo: getNodeInfo,
    nodeValue: getNodeValue,
    nodeMeta: getNodeMeta,

    edges: getEdges,
    edgeId: getEdgeId,
    edgeA: getEdgeA,
    edgeB: getEdgeB,
    edgeInfo: getEdgeInfo,
    edgeMeta: getEdgeMeta,
    edgeValues: getEdgeValues,

    suppressErrors = [],
  } = options;
  // As this data is created, there may be errors that are produced
  const errors: IMakeNetworkError<TNodeSource, TEdgeSource>[] = [];
  // Make a set from our list of errors to suppress so it can be utilized by our
  // makeError method.
  const suppress = new Set(suppressErrors || []);

  // List of nodes output into the network
  const nodeList: INode<TNodeMeta, TEdgeMeta>[] = [];
  // List of edges output into the network
  const edgeList: IEdge<TNodeMeta, TEdgeMeta>[] = [];
  // Create a lookup to retrieve a node by it's identifier
  const nodeMap = new Map<Identifier, INode<TNodeMeta, TEdgeMeta>>();
  // Create a lookup to retrieve an edge by it's identifier
  const edgeMap = new Map<Identifier, IEdge<TNodeMeta, TEdgeMeta>>();
  // Create the lookup that stores our atob edge lookup
  const atobMap: INetworkData<TNodeMeta, TEdgeMeta>["atobMap"] = new Map();

  // This contains all of the newly generated nodes that will be applied to the
  // network data object
  const newNodes = new Set<INode<TNodeMeta, TEdgeMeta>>();
  // This contains all of the newly generated edges that will be applied to the
  // network data object
  const newEdges = new Set<IEdge<TNodeMeta, TEdgeMeta>>();

  // As we loop through all of the nodes, we will have to gather all of the edge
  // flows found from those nodes first. AFTER ALL nodes have been processed we
  // then will be able to process the edge flows to convert them to Edge objects
  let allEdgeFlows: EdgeFlow<TEdgeSource>[] = [];

  // This is the network we will output as a result of the conversion
  const network: INetworkData<TNodeMeta, TEdgeMeta> = {
    nodes: nodeList,
    edges: edgeList,
    nodeMap,
    edgeMap,
    atobMap,
  };

  // In the event the edgeId accessor is not provided, we will generate an ID
  // the edges added in.
  let autoEdgeId = -1;

  // Loop through the source data objects and convert them into our network
  // information
  for await (const node of values(data)) {
    // Make our processing queue to process the elements as they are found
    // without recursion.
    const toProcess = [node];

    while (toProcess.length) {
      const processNode = toProcess.pop();
      if (!processNode) continue;

      // Get the identifiers of the node we are processing
      const nodeIds = makeList(
        access(processNode, getNodeId, isIdentifier) || []
      );

      // Loop through each identifier the single node produced to produce the
      // nodes that will be output for our network
      for (let i = 0, iMax = nodeIds.length; i < iMax; ++i) {
        const nodeId = nodeIds[i];

        // Validate the node identifier. We do NOT allow empty node ids
        if (nodeId === void 0 || nodeId === null) {
          makeError(suppress, errors, {
            error: MakeNetworkErrorType.BAD_ID,
            source: processNode,
            message: `An node was generated that has an invalid ID: "${nodeId}"`,
          });
        }

        // See if we have a created node for the given id
        const previousNode = nodeMap.get(nodeId);

        // If a node already exists, then this is a duplicate node and will
        // produce an error for our output
        if (previousNode) {
          makeError(suppress, errors, {
            error: MakeNetworkErrorType.DUPLICATE_NODE_ID,
            source: [previousNode, processNode],
            message:
              "Two nodes have the same Identifier. This overrides the previous node discovered",
          });

          newNodes.delete(previousNode);
        }

        // Get the node information, if any, for this particular identifier
        const nodeInfo = getNodeInfo?.(nodeId, i, processNode);

        // Create the new node we have derived
        const newNode: INode<TNodeMeta, TEdgeMeta> = {
          id: nodeId,
          in: [],
          out: [],
          value: access(processNode, getNodeValue, isWeights, nodeInfo) || 0,
          meta:
            access(
              processNode,
              getNodeMeta,
              (val: any): val is TNodeMeta => val
            ) || void 0,
        };

        // Set our node as the node for this provided identifier
        newNodes.add(newNode);
        nodeMap.set(nodeId, newNode);

        // We get the children from the node. These will be the next nodes to
        // be processed in the queue, but more importantly, nodes retrieved from
        // a node is cause to create an actual edge between the two.
        const nodeToNodes =
          access(processNode, getNodes, (val): val is TNodeSource[] =>
            Array.isArray(val)
          ) || [];

        // We add the new nodes discovered to our processing list
        for (let k = 0, kMax = nodeToNodes.length; k < kMax; ++k) {
          const node = nodeToNodes[k];
          toProcess.push(node);
        }

        // Get the edge sources from our node to node relationships
        const nodeToNodeEdgeFlows = nodeToNodes.map((childNode) =>
          access<NodePair<TNodeSource>, EdgeFlow<TEdgeSource>, never>(
            { a: processNode, b: childNode },
            getEdges,
            isEdgeFlow
          )
        );

        // Get the edges that may be referenced from the node itself
        const edgeFlow = access<TNodeSource, EdgeFlow<TEdgeSource>, never>(
          processNode,
          getEdges,
          isEdgeFlow
        );

        // Gather all of our edge flows we found into a single list for
        // processing and make sure each element is valid
        const edgeFlows = nodeToNodeEdgeFlows
          .concat(edgeFlow)
          .filter(isDefined);
        allEdgeFlows = allEdgeFlows.concat(edgeFlows);

        // If we have actual edge style objects connecting elements, then we
        // should process those edges to see if they are the connection to the
        // next set of nodes.
        getNodesForEdgeFlows<TNodeSource, TEdgeSource>(
          edgeFlow,
          getNodeA,
          getNodeB,
          toProcess,
          errors,
          suppress
        );
      }
    }
  }

  // Each edge flow must be processed now to convert them to Edge Objects. We
  // now have all of the listed nodes so we can properly reference everything by
  // identifier at this point, thus making valid edges
  for (let i = 0, iMax = allEdgeFlows.length; i < iMax; ++i) {
    const flow = allEdgeFlows[i];

    // Loop through the ab connections identified and create the Network
    // data style Edge object
    for (let k = 0, kMax = flow.ab.length; k < kMax; ++k) {
      const processEdge = flow.ab[k];
      const edgeIds = getEdgeId
        ? makeList(access(processEdge, getEdgeId, isIdentifier) || [])
        : [++autoEdgeId];

      // Just like nodes, each Edge Source can theoretically list multiple edges
      // albeit in rare complex cases.
      for (let j = 0, jMax = edgeIds.length; j < jMax; ++j) {
        const edgeId = edgeIds[j];

        if (edgeId === void 0 || edgeId === null) {
          makeError(suppress, errors, {
            error: MakeNetworkErrorType.BAD_ID,
            source: processEdge,
            message: "An edge was generated that has an invalid ID",
          });

          continue;
        }

        // Check for existing edges we have already parsed for this id to see if
        // we are triggering an override of an existing edge.
        const previousEdge = edgeMap.get(edgeId);

        if (previousEdge) {
          makeError(suppress, errors, {
            error: MakeNetworkErrorType.DUPLICATE_EDGE_ID,
            source: [previousEdge, processEdge],
            message:
              "Two edges have the same Identifier. This overrides the previous edge discovered",
          });

          newEdges.delete(previousEdge);
          removeFromMapOfMaps(atobMap, previousEdge.a, previousEdge.b);
        }

        // Get the info associated with the edge identifier so we can pass
        // it onto the next metrics
        const edgeInfo = getEdgeInfo?.(edgeId, j, processEdge);
        const edgeA = nodeMap.get(
          access(processEdge, getEdgeA, isIdentifier, edgeInfo) || ""
        );
        const edgeB = nodeMap.get(
          access(processEdge, getEdgeB, isIdentifier, edgeInfo) || ""
        );

        if (!edgeA || !edgeB) {
          makeError(suppress, errors, {
            error: MakeNetworkErrorType.NODE_NOT_FOUND,
            source: processEdge,
            message:
              "An edge targetted two nodes for it's a and b, but both were not found",
          });

          continue;
        }

        const edgeValues = access(
          processEdge,
          getEdgeValues,
          isEdgeWeights,
          edgeInfo
        );

        const newEdge: IEdge<TNodeMeta, TEdgeMeta> = {
          id: edgeId,
          a: edgeA,
          b: edgeB,
          atob: edgeValues?.ab || 0,
          btoa: edgeValues?.ba || 0,
          meta: access(processEdge, getEdgeMeta, isDefined, edgeInfo),
        };

        // Register the edge into the network info
        newEdges.add(newEdge);
        edgeMap.set(edgeId, newEdge);
        addToMapOfMaps(atobMap, newEdge.a, newEdge.b, newEdge);
      }
    }
  }

  // Apply all of our final edges and nodes we generated to the network data
  network.nodes = Array.from(newNodes.values());
  network.edges = Array.from(newEdges.values());

  // After all edges have been established, register each edge with it's
  // respective nodes
  for (let i = 0, iMax = network.edges.length; i < iMax; ++i) {
    const edge = network.edges[i];
    edge.a.out.push(edge);
    edge.b.in.push(edge);
  }

  // Output our new network data object with all errors that happened attached
  // to it
  return Object.assign(network, { errors });
}

/**
 * When we process the node sources and edge sources, we derive edge flows or
 * Edge Sources that indicated connection from a to b and b to a. We must
 * process those flows to look for nodes on each end of them for processing.
 */
function getNodesForEdgeFlows<TNodeSource, TEdgeSource>(
  edgeFlow: EdgeFlow<TEdgeSource> | null,
  getNodeA: Accessor<TEdgeSource, TNodeSource, never>,
  getNodeB: Accessor<TEdgeSource, TNodeSource, never>,
  toProcess: TNodeSource[],
  errors: IMakeNetworkError<TNodeSource, TEdgeSource>[],
  suppress: Set<MakeNetworkErrorType>
) {
  if (edgeFlow) {
    // Loop through the ab edges and retrieve the B node of the edge
    for (let k = 0, kMax = edgeFlow.ab.length; k < kMax; ++k) {
      const processEdge = edgeFlow.ab[k];
      // This processes the edge source information to identify the
      // connected nodes associated with the edge
      const edgeToNodeB = access<TEdgeSource, TNodeSource, never>(
        processEdge,
        getNodeB,
        isDefined
      );

      // Queue up the found node for processing
      if (edgeToNodeB) {
        toProcess.push(edgeToNodeB);
      } else {
        makeError(suppress, errors, {
          error: MakeNetworkErrorType.NODE_NOT_FOUND,
          source: processEdge,
          message:
            "Could not determine the NodeSource for the provided edge information",
        });
      }
    }

    // Loop through the ba edges and retrieve the A node of the edge
    for (let k = 0, kMax = edgeFlow.ab.length; k < kMax; ++k) {
      const processEdge = edgeFlow.ab[k];
      // This processes the edge source information to identify the
      // connected nodes associated with the edge
      const edgeToNodeA = access<TEdgeSource, TNodeSource, never>(
        processEdge,
        getNodeA,
        isDefined
      );

      // Queue up the found node for processing
      if (edgeToNodeA) {
        toProcess.push(edgeToNodeA);
      } else {
        makeError(suppress, errors, {
          error: MakeNetworkErrorType.NODE_NOT_FOUND,
          source: processEdge,
          message:
            "Could not determine the NodeSource for the provided edge information",
        });
      }
    }
  }
}

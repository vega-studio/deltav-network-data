import { DataProvider, values } from "simple-data-provider";
import {
  Accessor,
  Identifier,
  IEdge,
  INetworkData,
  INode,
  isDefined,
  isIdentifier,
  isWeightNumber,
  isWeights,
  Weights
} from "../types";
import { access } from "../util/access";
import { addToMapOfMaps } from "../util/map-of-maps";
import { removeEdge } from "./remove-edge";

type PartialObject = { [key: string]: any };

function isTuple<U extends PartialObject>(val: any): val is [Identifier, U] {
  return (
    Array.isArray(val) &&
    val.length === 2 &&
    isIdentifier(val[0]) &&
    !isIdentifier(val[1])
  );
}

/**
 * These are the modes available for the aggregation procedure.
 */
export enum MakeNetworkAggregateValueMode {
  /**
   * This is the default: values discovered (whether list or single number) will simply replace the previously found
   * values.
   */
  NONE,
  /**
   * DEFINED values discovered will cause overrides for the values at the index provided. Numbers and arrays are seen
   * as two separate entities and will fully overrid one another.
   * existing: [1, 2, 3] new: [0, 1] result: [0, 1, 3]
   * existing: [1, 2, 3] new: [undefined, 1] result: [1, 1, 3]
   * existing: 1 new: [2, 3, 4] result: [2, 3, 4]
   * existing: [1, 2, 3] new: 5 result: 5
   * exisiting: [undefined, 2, 3] new: [1] result: [1, 2, 3]
   */
  OVERRIDE,
  /**
   * As values are discovered, they will ALWAYS be concatenated to the end of the values
   */
  CONCAT
}

/**
 * Options for generating network data from a flat list of data.
 */
export interface IMakeNetworkOptions<
  TNodeSource,
  TEdgeSource,
  TNodeMeta,
  TEdgeMeta,
  TNodePartial extends PartialObject,
  TEdgePartial extends PartialObject
> {
  /**
   * Some datasets spread out the total configuration of a node or edge across multiple rows of data, such as edge
   * connections where it could be two rows that defines the edge connecting two nodes.
   *
   * For meta information: setting this to true will also cause fields for meta to be aggregated together. Same field
   * names across rows will override each other as discovered.
   *
   * Easy check to see if this needs to be true: Does an edge or node have all of it's information spread out across
   * more than one data row? If yes, this should be true. If data for each node and each edge is located in a single
   * row, then this should be false.
   */
  aggregateResults?: boolean;
  /**
   * ONLY IF AGGREGATE RESULTS IS FLAGGED AS TRUE:
   * When this is set, the values discovered
   */
  aggregateValueMode?: MakeNetworkAggregateValueMode;
  /**
   * If this is set, the data that originates the nodes and edges will be deleted as it's consumed. This helps reduce
   * memory pressure and RAM spikes. This only works for data Arrays and not function callbacks. If you use a function
   * callback, it is recommended that each callback does NOT retain or have stored in any form the data passed into this
   * converter.
   */
  deleteWhileProcessing?: boolean;
  /**
   * The accessor to retrieve the id of the node the edge originates from.
   * Provides data provided when the identifier was found.
   *
   * Accessors are either:
   *  "a property key as a string"
   * or a callback
   *  (dataRow) => dataRow.property
   */
  edgeA: Accessor<TEdgeSource, Identifier, TEdgePartial>;
  /**
   * The accessor to retrieve the id of the node the edge terminates at.
   * Provides data provided when the identifier was found.
   *
   * Accessors are either:
   *  "a property key as a string"
   * or a callback
   *  (dataRow) => dataRow.property
   */
  edgeB: Accessor<TEdgeSource, Identifier, TEdgePartial>;
  /** The data that needs to be converted to edges */
  edgeData: DataProvider<TEdgeSource>;
  /**
   * The accessor to retrieve the id of edges from the data. This can return a list of identifiers for the single row of
   * data. This will cause the row of data to get processed repeatedly for each identifier returned.
   *
   * Accessors are either:
   *  "a property key as a string"
   * or a callback
   *  (dataRow) => dataRow.property
   */
  edgeId: Accessor<
    TEdgeSource,
    | Identifier
    | Identifier[]
    | [Identifier, TEdgePartial]
    | [Identifier, TEdgePartial][],
    never
  >;
  /**
   * The accessor to retrieve all properties expected in the meta data of the edge.
   * Provides data provided when the identifier was found.
   *
   * Accessors are either:
   *  "a property key as a string"
   * or a callback
   *  (dataRow) => dataRow.property
   */
  edgeMeta: Accessor<TEdgeSource, TEdgeMeta, TEdgePartial>;
  /**
   * The accessor to retrieve the Weight values for an edge.
   * Provides data provided when the identifier was found.
   *
   * Accessors are either:
   *  "a property key as a string"
   * or a callback
   *  (dataRow) => dataRow.property
   */
  edgeValues?: Accessor<
    TEdgeSource,
    { ab: Weights; ba: Weights },
    TEdgePartial
  >;
  /**
   * The data that needs to be converted to nodes. This can be provided as a method for producing the row of data or
   * an async method that may have a fetch routine to the server to produce the data. Return a falsy value to stop
   * function callback returns.
   */
  nodeData: DataProvider<TNodeSource>;
  /**
   * The accessor to retrieve the id of nodes from the data. This can return a list of identifiers for the single row of
   * data. This will cause the row of data to get processed repeatedly for each identifier returned.
   *
   * Accessors are either:
   *  "a property key as a string"
   * or a callback
   *  (dataRow) => dataRow.property
   */
  nodeId: Accessor<
    TNodeSource,
    | Identifier
    | Identifier[]
    | [Identifier, TNodePartial]
    | [Identifier, TNodePartial][],
    never
  >;
  /**
   * The accessor to retrieve all properties expected in the meta data of the node.
   * Provides data provided when the identifier was found.
   *
   * Accessors are either:
   *  "a property key as a string"
   * or a callback
   *  (dataRow) => dataRow.property
   */
  nodeMeta: Accessor<TNodeSource, TNodeMeta, TNodePartial>;
  /**
   * The accessor to retrieve the Weight values for a node.
   * Provides data provided when the identifier was found.
   *
   * Accessors are either:
   *  "a property key as a string"
   * or a callback
   *  (dataRow) => dataRow.property
   */
  nodeValues?: Accessor<TNodeSource, Weights, TNodePartial>;
  /**
   * Supply this with a list of errors you wish to ignore. For instance, in some cases, it may be necessary to have
   * node's with duplicate identifiers.
   */
  suppressErrors?: MakeNetworkErrorType[];
}

/**
 * These are the type of errors you will encounter while processing the data.
 */
export enum MakeNetworkErrorType {
  /** An identifier happened that is invalid */
  BAD_ID,
  /** A lookup for a node happened, and there was no node found with the calculated identifier */
  NODE_NOT_FOUND,
  /** Two nodes were found with the same identifier. The most recent node will be the node preserved */
  DUPLICATE_NODE_ID,
  /** Two edges were found with the same identifier. The most recent edge will be the node preserved */
  DUPLICATE_EDGE_ID,
  /** System failure made an unknown type error */
  UNKNOWN
}

/**
 * This is the structure for an error message from the system.
 */
export interface IMakeNetworkError<T, U> {
  /** The error type discovered */
  error: MakeNetworkErrorType;
  /** The data source items that were the culprits in causing the error */
  source: T | U | T[] | U[] | (T | U)[];
  /** A readable message to explain the cause of the error */
  message: string;
}

/**
 * This is the expected result output from the make network operation.
 */
export interface IMakeNetworkResult<T, U, TNodeMeta, TEdgeMeta>
  extends INetworkData<TNodeMeta, TEdgeMeta> {
  /** All errors discovered while processing the data from old to new format */
  errors: IMakeNetworkError<T, U>[] | null;
}

/**
 * Handles generating and suppressing an error.
 */
function makeError<T, U>(
  suppress: Set<MakeNetworkErrorType>,
  errors: IMakeNetworkError<T, U>[],
  error: IMakeNetworkError<T, U>
) {
  if (suppress.has(error.error)) return;
  errors.push(error);
}

/**
 * Performs the correct aggregation strategy for values found during aggregate mode.
 */
function aggregateValue(
  mode: MakeNetworkAggregateValueMode,
  oldVal?: Weights,
  newVal?: Weights
) {
  switch (mode) {
    /**
     * Always appends defined discovered values. All undefined values will get stripped out.
     */
    case MakeNetworkAggregateValueMode.CONCAT: {
      if (oldVal === void 0) return newVal;
      if (newVal === void 0) return oldVal;

      if (isWeightNumber(oldVal)) {
        return [oldVal].concat(newVal);
      } else {
        oldVal.concat(newVal).filter(isDefined);
      }
    }

    /**
     * If the new value is defined, completely replace the old value with the new one found
     */
    case MakeNetworkAggregateValueMode.NONE: {
      if (newVal === void 0) {
        return oldVal;
      }
      return newVal;
    }

    /**
     * If either values are a number a complete override occurs. If both are a list, then the defined values in the new
     * list will override the values in the old list at the index the new list specified.
     */
    case MakeNetworkAggregateValueMode.OVERRIDE: {
      if (oldVal === void 0) return newVal;
      if (newVal === void 0) return oldVal;

      if (isWeightNumber(oldVal) || isWeightNumber(newVal)) {
        return newVal;
      }

      const longest = newVal.length > oldVal.length ? newVal : oldVal;
      const out = new Array(longest.length);

      for (let i = 0, iMax = newVal.length; i < iMax; ++i) {
        const num = newVal[i];
        if (num !== void 0) {
          out[i] = num;
        } else {
          out[i] = oldVal[i];
        }
      }

      return out;
    }
  }
}

/**
 * This consumes a list of data and processes the objects to become INode's and IEdge's. The goal of this method is to
 * help the processor reduce it's memory footprint of a previous dataset as it grows the new networked dataset.
 *
 * This helps with processing enormous data loads and careful attention should be paid to how you are handling your data.
 * Ensure there are not multiple copies of the data in some way and let it be converted to this new format.
 */
export async function makeNetwork<
  TNodeSource,
  TEdgeSource,
  TNodeMeta,
  TEdgeMeta,
  TNodePartial extends PartialObject,
  TEdgePartial extends PartialObject
>(
  options: IMakeNetworkOptions<
    TNodeSource,
    TEdgeSource,
    TNodeMeta,
    TEdgeMeta,
    TNodePartial,
    TEdgePartial
  >
): Promise<IMakeNetworkResult<TNodeSource, TEdgeSource, TNodeMeta, TEdgeMeta>> {
  const {
    aggregateResults,
    aggregateValueMode = MakeNetworkAggregateValueMode.NONE,
    edgeA,
    edgeB,
    edgeData,
    edgeId,
    edgeMeta,
    edgeValues,
    nodeData,
    nodeId,
    nodeMeta,
    nodeValues,
    suppressErrors
  } = options;
  const nodes: INode<TNodeMeta, TEdgeMeta>[] = [];
  const edges: IEdge<TNodeMeta, TEdgeMeta>[] = [];
  const errors: IMakeNetworkError<TNodeSource, TEdgeSource>[] = [];
  // This is a node UID that will be used if a UID cannot be determined from the accessor
  let nodeUID = 0;
  // This is an edge UID that will be used if a UID cannot be determined from the accessor
  let edgeUID = 0;
  // Create a lookup to retrieve a node by it's identifier
  const nodeMap = new Map<Identifier, INode<TNodeMeta, TEdgeMeta>>();
  // Create a lookup to retrieve an edge by it's identifier
  const edgeMap = new Map<Identifier, IEdge<TNodeMeta, TEdgeMeta>>();
  // Make a set from our list of errors to suppress
  const suppress = new Set(suppressErrors || []);
  // Create the lookup that stores our atob edge lookup
  const atobMap: INetworkData<TNodeMeta, TEdgeMeta>["atobMap"] = new Map();

  // This is the new network we're creating
  const network: IMakeNetworkResult<
    TNodeSource,
    TEdgeSource,
    TNodeMeta,
    TEdgeMeta
  > = {
    nodes,
    edges,
    nodeMap,
    edgeMap,
    atobMap,
    errors
  };

  // First map our data to node objects
  for await (const data of values(nodeData)) {
    // Get the identifier of the node for this particular row of data
    let idFeedback = access(data, nodeId, isIdentifier) || nodeUID++;
    if (!Array.isArray(idFeedback)) idFeedback = [idFeedback];
    if (isTuple(idFeedback)) idFeedback = [idFeedback];

    // List out our identifiers and id info
    const ids: Identifier[] = [];
    const infos: (TNodePartial | undefined)[] = [];

    for (let k = 0, kMax = idFeedback.length; k < kMax; ++k) {
      const check = idFeedback[k];
      if (isTuple(check)) {
        ids.push(check[0]);
        infos.push(check[1]);
      } else {
        ids.push(check);
        infos.push(void 0);
      }
    }

    // For all ids found for this given row: we process the row repeatedly per each id discovered
    for (let k = 0, kMax = ids.length; k < kMax; ++k) {
      const id = ids[k];
      const info = infos[k];
      // Get the previous node if it exists
      const previous = nodeMap.get(id);
      const value: Weights = access(data, nodeValues, isWeights, info) || [];
      const meta: TNodeMeta | undefined =
        access(data, nodeMeta, (val: any): val is TNodeMeta => val, info) ||
        void 0;
      let node: INode<TNodeMeta, TEdgeMeta> | undefined = void 0;

      // If we're aggregating results, then we modify the existing node for the node identifier
      if (aggregateResults) {
        if (previous) {
          previous.value =
            aggregateValue(aggregateValueMode, previous.value, value) || [];
          previous.meta = Object.assign({}, previous.meta, meta);
        } else {
          node = {
            id,
            in: [],
            out: [],
            value,
            meta
          };

          // Only in the case a new node is generated do we need to add it to the network object
          nodes.push(node);
          nodeMap.set(node.id, node);
        }
      }

      // If we're not aggregating results, then we simply make sure the node is created and create errors for duplicates
      else {
        node = {
          id,
          in: [],
          out: [],
          value,
          meta
        };

        // In non-aggregation mode, finding a second node of the same id is technically an error and will override the
        // previously found node.
        if (previous) {
          makeError(suppress, errors, {
            error: MakeNetworkErrorType.DUPLICATE_NODE_ID,
            source: [data, previous],
            message:
              "Two nodes have the same Identifier. This overrides the previous node discovered"
          });

          // Remove the previously found node
          nodes.splice(nodes.indexOf(previous), 1);
        }

        // Add the node to our network object
        nodes.push(node);
        nodeMap.set(node.id, node);
      }
    }
  }

  // This is a map to be used for the aggregation mode to harbor all the edges being pieced together
  const partialEdgeMap = new Map<
    Identifier,
    [Partial<IEdge<TNodeMeta, TEdgeMeta>>, (TNodeSource | TEdgeSource)[]]
  >();

  // We now convert our edge data into real edges
  for await (const data of values(edgeData)) {
    // Find the edge identifier this data row is associated with
    let idFeedback = access(data, edgeId, isIdentifier) || edgeUID++;
    if (!Array.isArray(idFeedback)) idFeedback = [idFeedback];
    if (isTuple(idFeedback)) idFeedback = [idFeedback];

    // List out our identifiers and id info
    const ids: Identifier[] = [];
    const infos: (TEdgePartial | undefined)[] = [];

    for (let k = 0, kMax = idFeedback.length; k < kMax; ++k) {
      const check = idFeedback[k];
      if (isTuple(check)) {
        ids.push(check[0]);
        infos.push(check[1]);
      } else {
        ids.push(check);
        infos.push(void 0);
      }
    }

    // For every id discovered, we need to process the row again
    for (let k = 0, kMax = ids.length; k < kMax; ++k) {
      const id = ids[k];
      const info = infos[k];
      // Find any nodes associated with this edge
      const a = access(data, edgeA, isIdentifier, info) || "";
      const b = access(data, edgeB, isIdentifier, info) || "";
      const nodeA = nodeMap.get(a);
      const nodeB = nodeMap.get(b);

      // Retrieve the values this edge will have assigned to it
      const values = access(
        data,
        edgeValues,
        (val: any): val is { ab: Weights; ba: Weights } =>
          val && isWeights(val.ab) && isWeights(val.ba),
        info
      ) || {
        ab: [],
        ba: []
      };
      // Retrieve the meta information this row contains
      const meta =
        access(data, edgeMeta, (val: any): val is TEdgeMeta => val, info) ||
        undefined;

      // For aggregation, we gather as much edge information as possible for the provided data row, then we validate each
      // edge after all data has been processed first.
      if (aggregateResults) {
        const previousPair = partialEdgeMap.get(id);

        // If a previous partial edge exists add to and modify it
        if (previousPair) {
          const previous = previousPair[0];
          previousPair[1].push(data);

          if (nodeA) previous.a = nodeA;
          if (nodeB) previous.b = nodeB;

          if (
            (Array.isArray(values.ab) && values.ab.length > 0) ||
            (values.ab as any).toFixed
          ) {
            previous.atob = aggregateValue(
              aggregateValueMode,
              previous.atob,
              values.ab
            );
          }

          if (
            (Array.isArray(values.ba) && values.ba.length > 0) ||
            (values.ba as any).toFixed
          ) {
            previous.btoa = aggregateValue(
              aggregateValueMode,
              previous.btoa,
              values.ba
            );
          }

          previous.meta = Object.assign({}, previous.meta, meta);
        }

        // Otherwise, create a new edge
        else {
          const edge: Partial<IEdge<TNodeMeta, TEdgeMeta>> = {
            id,
            a: nodeA,
            b: nodeB,
            atob: values.ab,
            btoa: values.ba,
            meta
          };

          partialEdgeMap.set(id, [edge, []]);
        }
      }

      // For non-aggregation, we check for edge duplicate errors and ensure the provided data row has proper nodes for
      // each end of the edge.
      else {
        const previous = edgeMap.get(id);

        // Ensure both nodes can be found for the edge. If not, this is an invalid edge and will not be a part of the data.
        if (!nodeA || !nodeB) {
          makeError(suppress, errors, {
            error: MakeNetworkErrorType.NODE_NOT_FOUND,
            source: data,
            message:
              !a && !b
                ? "Could not find either node for this edge"
                : !a
                ? "Could not find node a for this edge"
                : !b
                ? "Could not find node b for this edge"
                : "Error"
          });

          continue;
        }

        // Create the new format edge type
        const edge: IEdge<TNodeMeta, TEdgeMeta> = {
          id,
          a: nodeA,
          b: nodeB,
          atob: values.ab,
          btoa: values.ba,
          meta
        };

        // We must produce errors for duplicate edge identifiers
        if (previous) {
          makeError(suppress, errors, {
            error: MakeNetworkErrorType.DUPLICATE_EDGE_ID,
            source: [data, previous],
            message:
              "Two edges have the same Identifier. This overrides the previous edge discovered"
          });

          // Remove the previous edge from the network
          removeEdge(network, previous);
        }

        // Add the edge to the newly created edges
        edges.push(edge);
        // Add a lookup for the edge by it's identifier
        edgeMap.set(edge.id, edge);
        // Add the edge to it's nodes
        edge.a.out.push(edge);
        edge.b.in.push(edge);
        // Store the atob mapping this edge creates
        addToMapOfMaps(atobMap, edge.a, edge.b, edge);
      }
    }
  }

  // In aggregation mode for edges, we have one final pass: analyze all of the partial edges we have accumulated and
  // determine which ones are valid edges. We will error on edges partially created but do not properly represent a
  // connection
  if (aggregateResults) {
    partialEdgeMap.forEach(pair => {
      const edge = pair[0];
      const data = pair[1];

      // Validate the ID
      if (!edge.id) {
        makeError(suppress, errors, {
          error: MakeNetworkErrorType.BAD_ID,
          source: data,
          message: "An edge was generated that has an invalid ID"
        });

        return;
      }

      // Validate that a connection exists
      if (!edge.a || !edge.b) {
        const a = edge.a;
        const b = edge.b;

        makeError(suppress, errors, {
          error: MakeNetworkErrorType.NODE_NOT_FOUND,
          source: data,
          message:
            !a && !b
              ? "Could not find either node for this edge"
              : !a
              ? "Could not find node a for this edge"
              : !b
              ? "Could not find node b for this edge"
              : "Error"
        });

        return;
      }

      // Make our edge object that will really be there
      const newEdge: IEdge<TNodeMeta, TEdgeMeta> = {
        id: edge.id,
        a: edge.a,
        b: edge.b,
        atob: edge.atob || [],
        btoa: edge.btoa || [],
        meta: edge.meta
      };

      // Add the new edge to the network
      // Add the edge to the newly created edges
      edges.push(newEdge);
      // Add a lookup for the edge by it's identifier
      edgeMap.set(newEdge.id, newEdge);
      // Add the edge to it's nodes
      newEdge.a.out.push(newEdge);
      newEdge.b.in.push(newEdge);
      // Store the atob mapping this edge creates
      addToMapOfMaps(atobMap, newEdge.a, newEdge.b, newEdge);

      edgeMap.set(newEdge.id, newEdge);
    });
  }

  return network;
}

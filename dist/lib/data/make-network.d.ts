import { DataProvider } from "simple-data-provider";
import { Accessor, Identifier, IMakeNetworkResult, MakeNetworkErrorType, PartialObject, Weights } from "../types";
/**
 * These are the modes available for the aggregation procedure.
 */
export declare enum MakeNetworkAggregateValueMode {
    /**
     * This is the default: values discovered (whether list or single number) will
     * simply replace the previously found values.
     */
    NONE = 0,
    /**
     * DEFINED values discovered will cause overrides for the values at the index
     * provided. Numbers and arrays are seen as two separate entities and will
     * fully overrid one another.
     *
     * - existing: [1, 2, 3] new: [0, 1] result: [0, 1, 3]
     * - existing: [1, 2, 3] new: [undefined, 1] result: [1, 1, 3]
     * - existing: 1 new: [2, 3, 4] result: [2, 3, 4]
     * - existing: [1, 2, 3] new: 5 result: 5
     * - exisiting: [undefined, 2, 3] new: [1] result: [1, 2, 3]
     */
    OVERRIDE = 1,
    /**
     * As values are discovered, they will ALWAYS be concatenated to the end of
     * the values
     */
    CONCAT = 2
}
/**
 * Options for generating network data from a flat list of data.
 */
export interface IMakeNetworkOptions<TNodeSource, TEdgeSource, TNodeMeta, TEdgeMeta, TNodeInfo extends PartialObject, TEdgeInfo extends PartialObject> {
    /**
     * Some datasets spread out the total configuration of a node or edge across
     * multiple rows of data, such as edge connections where it could be two rows
     * that defines the edge connecting two nodes.
     *
     * Easy check to see if this needs to be true: Does an edge or node have all
     * of it's information spread out across more than one data row? If yes, this
     * should be true. If data for each node and each edge is located in a single
     * row, then this should be false.
     */
    aggregateResults?: boolean;
    /**
     * ONLY IF AGGREGATE RESULTS IS FLAGGED AS TRUE:
     * When this is set, the values discovered
     */
    aggregateValueMode?: MakeNetworkAggregateValueMode;
    /**
     * If this is set, the data that originates the nodes and edges will be
     * deleted as it's consumed. This helps reduce memory pressure and RAM spikes.
     * This only works for data Arrays and not function callbacks. If you use a
     * function callback, it is recommended that each callback does NOT retain or
     * have stored in any form the data passed into this converter.
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
    edgeA: Accessor<TEdgeSource, Identifier, TEdgeInfo>;
    /**
     * The accessor to retrieve the id of the node the edge terminates at.
     * Provides data provided when the identifier was found.
     *
     * Accessors are either:
     *  "a property key as a string"
     * or a callback
     *  (dataRow) => dataRow.property
     */
    edgeB: Accessor<TEdgeSource, Identifier, TEdgeInfo>;
    /** The data that needs to be converted to edges */
    edgeData: DataProvider<TEdgeSource>;
    /**
     * The accessor to retrieve the id of edges from the data. This can return a
     * list of identifiers for the single row of data. This will cause the row of
     * data to get processed repeatedly for each identifier returned.
     *
     * Accessors are either:
     *
     * "a property key as a string"
     *
     * or a callback
     *
     * (dataRow) => dataRow.property
     */
    edgeId: Accessor<TEdgeSource, Identifier | Identifier[], never>;
    /**
     * After identifiers are created, this will associate some form of information
     * with the identifier provided. This information gets passed into the
     * accessors of the other edge properties.
     */
    edgeInfo?(id: Identifier, idIndex: number, row: TEdgeSource): TEdgeInfo;
    /**
     * The accessor to retrieve all properties expected in the meta data of the
     * edge. Provides data provided when the identifier was found.
     *
     * Accessors are either: "a property key as a string" or a callback (dataRow)
     *  => dataRow.property
     */
    edgeMeta: Accessor<TEdgeSource, TEdgeMeta, TEdgeInfo>;
    /**
     * The accessor to retrieve the Weight values for an edge.
     * Provides data provided when the identifier was found.
     *
     * Accessors are either:
     *  "a property key as a string"
     * or a callback
     *  (dataRow) => dataRow.property
     */
    edgeValues?: Accessor<TEdgeSource, {
        ab?: Weights;
        ba?: Weights;
    } | undefined, TEdgeInfo>;
    /**
     * The data that needs to be converted to nodes. This can be provided as a
     * method for producing the row of data or an async method that may have a
     * fetch routine to the server to produce the data. Return a falsy value to
     * stop function callback returns.
     */
    nodeData: DataProvider<TNodeSource>;
    /**
     * The accessor to retrieve the id of nodes from the data. This can return a
     * list of identifiers for the single row of data. This will cause the row of
     * data to get processed repeatedly for each identifier returned.
     *
     * Accessors are either: "a property key as a string" or a callback (dataRow)
     *  => dataRow.property
     */
    nodeId: Accessor<TNodeSource, Identifier | Identifier[], never>;
    /**
     * After identifiers are created, this will associate some form of information
     * with the identifier provided. This information gets passed into the
     * accessors of the other node properties.
     */
    nodeInfo?(id: Identifier, idIndex: number, row: TNodeSource): TNodeInfo;
    /**
     * The accessor to retrieve all properties expected in the meta data of the
     * node. Provides data provided when the identifier was found.
     *
     * Accessors are either: "a property key as a string" or a callback (dataRow)
     *  => dataRow.property
     */
    nodeMeta: Accessor<TNodeSource, TNodeMeta, TNodeInfo>;
    /**
     * The accessor to retrieve the Weight values for a node.
     * Provides data provided when the identifier was found.
     *
     * Accessors are either:
     *  "a property key as a string"
     * or a callback
     *  (dataRow) => dataRow.property
     */
    nodeValues?: Accessor<TNodeSource, Weights | undefined, TNodeInfo>;
    /**
     * Supply this with a list of errors you wish to ignore. For instance, in some
     * cases, it may be necessary to have node's with duplicate identifiers.
     */
    suppressErrors?: MakeNetworkErrorType[];
}
/**
 * This consumes a list of data and processes the objects to become INode's and
 * IEdge's. The goal of this method is to help the processor reduce it's memory
 * footprint of a previous dataset as it grows the new networked dataset.
 *
 * This helps with processing enormous data loads and careful attention should
 * be paid to how you are handling your data. Ensure there are not multiple
 * copies of the data in some way and let it be converted to this new format.
 */
export declare function makeNetwork<TNodeSource, TEdgeSource, TNodeMeta, TEdgeMeta, TNodePartial extends PartialObject, TEdgePartial extends PartialObject>(options: IMakeNetworkOptions<TNodeSource, TEdgeSource, TNodeMeta, TEdgeMeta, TNodePartial, TEdgePartial>): Promise<IMakeNetworkResult<TNodeSource, TEdgeSource, TNodeMeta, TEdgeMeta>>;

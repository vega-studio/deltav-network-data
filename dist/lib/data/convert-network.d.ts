import { DataProvider } from "simple-data-provider";
import { Accessor, Identifier, IMakeNetworkResult, MakeNetworkErrorType, Weights } from "../types";
export declare type NodePair<TNode> = {
    a: TNode;
    b: TNode;
};
export declare type EdgeFlow<TEdge> = {
    ab: TEdge[];
    ba: TEdge[];
};
export declare type EdgeValues = {
    ab?: Weights;
    ba?: Weights;
} | undefined;
export declare function isNodePair<TNode>(val: any): val is NodePair<TNode>;
export interface IConvertNetworkOptions<TNodeSource, TEdgeSource, TNodeMeta, TEdgeMeta, TNodeInfo, TEdgeInfo> {
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
    edges: Accessor<TNodeSource | NodePair<TNodeSource>, {
        ab: TEdgeSource[];
        ba: TEdgeSource[];
    }, TEdgeInfo>;
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
export declare function convertNetwork<TNodeSource, TEdgeSource, TNodeMeta, TEdgeMeta, TNodeInfo, TEdgeInfo>(options: IConvertNetworkOptions<TNodeSource, TEdgeSource, TNodeMeta, TEdgeMeta, TNodeInfo, TEdgeInfo>): Promise<IMakeNetworkResult<TNodeSource, TEdgeSource, TNodeMeta, TEdgeMeta>>;

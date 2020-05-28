interface IValuedObject {
    /** A name for the node. May not be unique */
    name: string;
    /** A date value on the node */
    dateMetric: Date;
    /** A numerical value on the node */
    numMetric: number;
    /** A string value on the node */
    strMetric: string;
    /** A guaranteed UID identifier */
    UID?: string | number;
}
export interface IRandomNode extends IValuedObject {
}
export interface IRandomNodeWithEdge extends IValuedObject {
    /** A list of nodes this node connects to */
    siblings: (string | number)[];
}
export interface IRandomEdge extends IValuedObject {
    /** Guaranteed to point to a Node's UID */
    UID_A?: string | number;
    /** Guaranteed to point to a Node's UID */
    UID_B?: string | number;
}
/**
 * Generates ramdomized node data. Each node for a given index will always be
 * the same:
 *
 * genNodes(5) === genNodes(5) (deeply equals, not object pointerequals)
 *
 * also
 *
 * genNodes(5) === genNodes(15) for the first 5 nodes
 */
export declare function randomNodes(words: string[], count: number): IRandomNode[];
/**
 * This generates random node data that has the connection information in the
 * node data and NOT in a seperate edge data list.
 */
export declare function randomNodesWithEdges(words: string[], count: number, edgesPerNode: number): IRandomNodeWithEdge[];
/**
 * Generates randomized edge data. Each node for a given index will always be
 * the same if the input node list is the same:
 *
 * nodes = genNodes(5)
 *
 * genEdges(nodes, 5) === genEdges(nodes, 5) (deeply equals, not object pointer
 * equals)
 *
 * also
 *
 * genEdges(nodes, 5) === genEdges(nodes, 15) for the first 5 edges
 */
export declare function randomEdges(words: string[], nodes: IRandomNode[], count: number): IRandomEdge[];
/**
 * This is a helpful method for generating a randomized network data object
 */
export declare function randomNetwork<TNodeMeta, TEdgeMeta>(words: string[], nodeCount: number, edgeCount: number, nodeMeta: (nodeRow: IRandomNode) => TNodeMeta, edgeMeta: (edgeRow: IRandomEdge) => TEdgeMeta): Promise<import("..").IMakeNetworkResult<IRandomNode, IRandomEdge, TNodeMeta, TEdgeMeta>>;
export {};

import { AnalyzeNode, FlowDirection, IEdge, INode } from "../types";
export interface INeighborsOptions<TNodeMeta, TEdgeMeta> {
    /** This is a set of nodes to exclude from the result */
    exclude?: Set<AnalyzeNode<TNodeMeta, TEdgeMeta>>;
    /**
     * This specifies which direction of edge to consider for finding the
     * neighbors. If not specified this defaults to "BOTH" for the direction.
     */
    flow?: FlowDirection;
    /**
     * When node exclusions are provided, this states whether or not you want the
     * edge to the excluded node included in the results. The property will ONLY
     * be provided if "exclude" is provided as an option.
     */
    includeEdgeToExcludedNode?: boolean;
    /**
     * When set, the result will contain a property that shows which nodes were
     * excluded from the operation as a result of the node being in the exclude
     * set.
     */
    includeExcludedNodes?: boolean;
    /**
     * A network can have nodes that have circular references (Where the edge's
     * "a" === the edge's "b"). The input node for finding it's neighbors by
     * definition of "neighbor" IS an excluded node. HOWEVER, the edge is a
     * special sort of neighboring edge that may be desired in the output of this
     * method.
     *
     * So, set this property to have the potential circular reference edge
     * included in the results. Otherwise, for most normal cases, the edge should
     * be excluded, thus do not set this.
     */
    includeEdgeForCircularReference?: boolean;
    /** This is the target node we want to collect the neighbors for. */
    node: AnalyzeNode<TNodeMeta, TEdgeMeta>;
}
/**
 * This method gathers neighboring nodes of an input node. You can optionally
 * exclude nodes from the returned list.
 *
 * If includeEdgeToExcludedNode is set, then when a node is excluded, the result
 * will still contain the edge that went to the node.
 */
export declare function neighbors<TNodeMeta, TEdgeMeta>(options: INeighborsOptions<TNodeMeta, TEdgeMeta>): {
    nodes: INode<TNodeMeta, TEdgeMeta>[];
    edges: IEdge<TNodeMeta, TEdgeMeta>[];
    excluded: Set<INode<TNodeMeta, TEdgeMeta>> | undefined;
    edgeToExclusion: IEdge<TNodeMeta, TEdgeMeta>[] | undefined;
};

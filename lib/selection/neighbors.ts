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
export function neighbors<TNodeMeta, TEdgeMeta>(
  options: INeighborsOptions<TNodeMeta, TEdgeMeta>
) {
  const {
    node,
    exclude,
    includeEdgeToExcludedNode,
    includeExcludedNodes,
    includeEdgeForCircularReference,
    flow,
  } = options;
  const nodes = [];
  const edges = [];
  let edgeToExclusion: IEdge<TNodeMeta, TEdgeMeta>[] | undefined;

  if (includeEdgeToExcludedNode) {
    edgeToExclusion = [];
  }

  // If flow direction is set, then we can specify which directions to include
  // If flow is not included or is BOTH then we include both directions.
  // BOTH === 0 so evaluating flow to falsey is valid here.
  const includeIn = flow ? flow === FlowDirection.IN : true;
  const includeOut = flow ? flow === FlowDirection.OUT : true;
  let excluded: Set<INode<TNodeMeta, TEdgeMeta>> | undefined;

  if (includeExcludedNodes) {
    excluded = new Set();
  }

  if (exclude) {
    // Gather incoming nodes
    if (includeIn) {
      for (let i = 0, iMax = node.in.length; i < iMax; ++i) {
        const edge = node.in[i];

        // Circular reference handling
        if (edge.a === edge.b) {
          if (includeEdgeForCircularReference) {
            edges.push(edge);
          }
          continue;
        }

        if (!exclude.has(edge.a)) {
          nodes.push(edge.a);
          edges.push(edge);
        } else if (edgeToExclusion) {
          if (excluded) {
            excluded.add(edge.a);
          }

          edgeToExclusion.push(edge);
        }
      }
    }

    // Gather outgoing nodes
    if (includeOut) {
      for (let i = 0, iMax = node.out.length; i < iMax; ++i) {
        const edge = node.out[i];

        // Circular reference handling. If we included "In flows" then we don't
        // need to process this again as the in flows will contain the same
        // circular reference as the outflows
        if (edge.a === edge.b) {
          if (includeEdgeForCircularReference && !includeIn) {
            edges.push(edge);
          }
          continue;
        }

        if (!exclude.has(edge.b)) {
          nodes.push(edge.b);
          edges.push(edge);
        } else if (edgeToExclusion) {
          if (excluded) {
            excluded.add(edge.a);
          }

          edgeToExclusion.push(edge);
        }
      }
    }
  } else {
    // Gather incoming nodes
    if (includeIn) {
      for (let i = 0, iMax = node.in.length; i < iMax; ++i) {
        const edge = node.in[i];

        // Circular reference handling
        if (edge.a === edge.b) {
          if (includeEdgeForCircularReference) {
            edges.push(edge);
          }
          continue;
        }

        nodes.push(edge.a);
        edges.push(edge);
      }
    }

    // Gather outgoing nodes
    if (includeOut) {
      for (let i = 0, iMax = node.out.length; i < iMax; ++i) {
        const edge = node.out[i];

        // Circular reference handling. If we included "In flows" then we don't
        // need to process this again as the in flows will contain the same
        // circular reference as the outflows
        if (edge.a === edge.b) {
          if (includeEdgeForCircularReference && !includeIn) {
            edges.push(edge);
          }
          continue;
        }

        nodes.push(edge.b);
        edges.push(edge);
      }
    }
  }

  return {
    nodes,
    edges,
    excluded,
    edgeToExclusion,
  };
}

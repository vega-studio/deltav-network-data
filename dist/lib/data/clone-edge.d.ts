import { AnalyzeEdge, Identifier, IEdge } from "../types";
/**
 * Makes a new edge with the same properties as the input. You can optionally make a new identifier for the clones element.
 */
export declare function cloneEdge<TNodeMeta, TEdgeMeta>(a: AnalyzeEdge<TNodeMeta, TEdgeMeta>, id?: Identifier): IEdge<TNodeMeta, TEdgeMeta>;

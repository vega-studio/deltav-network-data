import { AnalyzeNode, Identifier, INode } from "../types";
/**
 * This method copies a node into a new node object. You can optionally set a new id for the newly created node.
 */
export declare function cloneNode<TNodeMeta, TEdgeMeta>(a: AnalyzeNode<TNodeMeta, TEdgeMeta>, id?: Identifier): INode<TNodeMeta, TEdgeMeta>;

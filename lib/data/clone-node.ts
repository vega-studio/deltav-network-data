import { AnalyzeNode, Identifier, INode } from "../types";

/**
 * This method copies a node into a new node object. You can optionally set a new id for the newly created node.
 */
export function cloneNode<TNodeMeta, TEdgeMeta>(
  a: AnalyzeNode<TNodeMeta, TEdgeMeta>,
  id?: Identifier
): INode<TNodeMeta, TEdgeMeta> {
  return {
    id: id !== void 0 ? id : a.id,
    in: a.in.slice(0),
    out: a.out.slice(0),
    value: Array.isArray(a.value) ? a.value.slice(0) : a.value,
    meta: a.meta,
  };
}

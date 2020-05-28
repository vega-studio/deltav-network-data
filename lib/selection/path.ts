import { hasNode } from "../calculate/has-node";
import { AnalyzeNetwork, AnalyzeNode, IEdge, INode } from "../types";
import { RippleSelect } from "./ripple-select";
import { travelCollisionPath } from "./travel-collision-path";

export type PathNode<TNodeMeta, TEdgeMeta> =
  | [INode<TNodeMeta, TEdgeMeta>]
  | [INode<TNodeMeta, TEdgeMeta>, IEdge<TNodeMeta, TEdgeMeta>];
export type PathResult<TNodeMeta, TEdgeMeta> = PathNode<TNodeMeta, TEdgeMeta>[];

/**
 * TODO: NOT IMPLEMENTED
 *
 * This method provides the shortest path between two nodes. The path is a list
 * of each node, in order, from point a to point b.
 *
 * If there are equally long paths between the two nodes, this will provide
 * all paths available.
 *
 * A stepper function can be provided to control how fast the pathing eats
 * through the network. This utilizes the Ripple Search, so you can read on that
 * operation to determine how best to utilize making the system wait per step to
 * save on processing per frame. If you do not provide the stepper callback, the
 * search will be blocking until a result is achieved.
 */
export async function path<TNodeMeta, TEdgeMeta>(
  network: AnalyzeNetwork<TNodeMeta, TEdgeMeta>,
  a: AnalyzeNode<TNodeMeta, TEdgeMeta>,
  b: AnalyzeNode<TNodeMeta, TEdgeMeta>,
  step?: () => Promise<void>
): Promise<PathResult<TNodeMeta, TEdgeMeta>[]> {
  // Ensure both nodes specified are within the network in question
  if (!hasNode(network, [a, b])) return [];

  const ripple = new RippleSelect();
  const outPath = new Map<number, PathResult<TNodeMeta, TEdgeMeta>>();

  await ripple.splash(
    {
      startNodes: [a, b],
      includeCollisions: true,
      includePath: true,
    },
    async (result) => {
      let stop = false;
      const path = result.path;
      if (!path) return;

      if (result.nodeCollisions && result.nodeCollisions.size > 0) {
        result.nodeCollisions.forEach((sources, collision) => {
          travelCollisionPath(
            collision,
            sources,
            path,
            (_node, _step, _path) => {
              // TODO
            },
            (_edge, _step) => {
              // TODO
            }
          );
        });

        // On first collisions we stop as they are the nearest junction between
        // the two nodes.
        stop = true;
      }

      if (result.edgeCollisions && result.edgeCollisions.size > 0) {
        // On first collisions we stop as they are the nearest junction between
        // the two nodes.
        stop = true;
      }

      if (stop) return { stop: true };

      if (step) {
        await step();
      }

      return;
    }
  );

  return Array.from(outPath.values());
}

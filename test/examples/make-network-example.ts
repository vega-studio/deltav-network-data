import { copy4, Vec4 } from "deltav";
import { IEdge, RippleSelect } from "../../lib";
import { travelCollisionPath } from "../../lib/selection/travel-collision-path";
import { renderNetwork } from "./render-network";

export async function makeNetworkExample() {
  const container = document.getElementById("make-network-graphics");
  if (!container) return;
  const network = await renderNetwork(container, 100, 200);
  if (!network) return;

  const ripple = new RippleSelect();
  const start = network.nodes[0];
  const allEdges = new Set<IEdge<any, any>>();
  const startA = network.nodes[0];
  const startB = network.nodes[37];

  const color: Vec4[] = [
    [1, 1, 1, 1],
    [0, 0, 1, 1],
    [0, 0, 1, 1],
    [0, 0, 1, 1],
    [0, 0, 1, 1],
    [0, 0, 1, 0.8],
    [0, 0, 1, 0.6],
    [0, 0, 1, 0.4],
    [0, 0, 1, 0.2],
    [0, 0, 1, 0.2],
  ];

  await ripple.splash(
    {
      startNodes: [startA, startB],
      includeCollisions: true,
      includePath: true,
    },
    async (result) => {
      const path = result.path;
      if (!path) return;

      result.nodes.forEach((n) => {
        if (!n.meta) return;
        n.meta.shape.color = color[result.depth];
      });

      result.edges.forEach((n) => {
        if (!n.meta) return;
        if (result.depth === 1) {
          n.meta.shape.startColor = copy4(color[0]);
          n.meta.shape.endColor = copy4(color[0]);
        } else {
          n.meta.shape.startColor = copy4(color[result.depth]);
          n.meta.shape.endColor = copy4(color[result.depth]);
        }
      });

      if (result.nodeCollisions) {
        result.nodeCollisions.forEach((sources, collision) => {
          // Get all of the nodes prior to the collision and follow them back to
          // their source.
          travelCollisionPath(
            collision,
            sources,
            path,
            (node, step) => {
              const shape = node.meta?.shape;
              if (!shape) return;
              if (step === 0) shape.color = [1, 0, 0, 1];
              else shape.color = [0, 1, 0, 1];
              if (result.source?.get(node) === node) shape.color = [1, 1, 1, 1];
            },
            (edge) => {
              const shape = edge.meta?.shape;
              if (!shape) return;
              shape.startColor = [0, 1, 0, 1];
              shape.endColor = [0, 1, 0, 1];
            }
          );
        });

        if (result.nodeCollisions.size > 0) {
          return { stop: true };
        }
      }

      if (result.edgeCollisions && result.edgeCollisions.size > 0) {
        result.edgeCollisions.forEach((collision) => {
          // Get all of the nodes prior to the collision and follow them back to
          // their source.
          travelCollisionPath(
            collision,
            [],
            path,
            (node, step) => {
              const shape = node.meta?.shape;
              if (!shape) return;
              if (step === 0) shape.color = [1, 0, 0, 1];
              else shape.color = [0, 1, 0, 1];
              if (result.source?.get(node) === node) shape.color = [1, 1, 1, 1];
            },
            (edge, step) => {
              const shape = edge.meta?.shape;
              if (!shape) return;

              if (step === 0) {
                shape.startColor = [1, 0, 0, 1];
                shape.endColor = [1, 0, 0, 1];
              } else {
                shape.startColor = [0, 1, 0, 1];
                shape.endColor = [0, 1, 0, 1];
              }
            }
          );
        });
      }
    }
  );
}

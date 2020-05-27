import { copy4, Vec4 } from "deltav";
import { IEdge, RippleSelect } from "../../lib";
import { renderNetwork } from "./render-network";

export async function test() {
  const container = document.getElementById("test-graphics");
  if (!container) return;
  const network = await renderNetwork(container, 100, 1000);
  if (!network) return;

  const ripple = new RippleSelect();
  const start = network.nodes[0];

  const allEdges = new Set<IEdge<any, any>>();

  const startA = network.nodes[0];
  const startB = network.nodes[network.nodes.length - 1];

  const color: Vec4[] = [
    [1, 1, 1, 1],
    [1, 1, 0, 1],
    [0, 1, 0, 1],
    [0, 0, 1, 1],
    [1, 0, 1, 1],
  ];

  await ripple.splash(
    {
      startNodes: [startA, startB],
      includeCollisions: true,
    },
    async (result) => {
      result.nodes.forEach((n) => {
        if (!n.meta) return;
        n.meta.shape.color = color[result.depth];
      });

      result.edges.forEach((n) => {
        if (!n.meta) return;
        n.meta.shape.startColor = copy4(color[result.depth]);
        n.meta.shape.endColor = copy4(color[result.depth]);
        n.meta.shape.startColor[3] = 0.2;
        n.meta.shape.endColor[3] = 0.2;
      });

      if (result.nodeCollisions) {
        result.nodeCollisions.forEach((sources, collision) => {
          if (!collision.meta) return;
          collision.meta.shape.color = [1, 0, 0, 1];
        });
      }

      if (result.edgeCollisions && result.edgeCollisions.size > 0) {
        result.edgeCollisions.forEach((sources, collision) => {
          if (!collision.meta) return;
          collision.meta.shape.startColor = [1, 0, 0, 0.2];
          collision.meta.shape.endColor = [1, 0, 0, 0.2];
        });
      }
    }
  );
}

import { scaleLinear } from "d3-scale";
import {
  add2,
  CircleInstance,
  copy4,
  EdgeInstance,
  subtract2,
  Vec4,
} from "deltav";
import { QuickSurface } from "deltav-quick-surface";
import { IEdge, INode, maxWeight, randomNetwork } from "../../lib";
import { nodeWeightRange } from "../../lib/calculate/node-weight-range";
import { WORDS } from "../data/word-list";

const randomSeed = require("random-seed");
const random = randomSeed.create("test");

export async function renderNetwork(
  container: HTMLElement,
  nodeCount: number,
  edgeCount: number
) {
  if (!container) return;

  // Generate the network data from the raw data we generated.
  const network = await randomNetwork(
    WORDS,
    nodeCount,
    edgeCount,
    () => ({
      shape: new CircleInstance({
        center: [0, 0],
        radius: 1,
        color: [1, 1, 1, 1],
      }),
    }),
    () => ({
      shape: new EdgeInstance({
        start: [0, 0],
        end: [0, 0],
      }),
    })
  );

  // Store maps of our shapes we will generate to the network objects they represent
  const shapeToNode = new Map<CircleInstance, INode<any, any>>();
  const shapeToEdge = new Map<EdgeInstance, IEdge<any, any>>();
  // Gather our shapes as our data points
  const circleShapes: CircleInstance[] = [];
  const edgeShapes: EdgeInstance[] = [];

  // Calculate range of weights on the nodes
  const weightRange = nodeWeightRange(network);
  // Get the size of the screen we are about to display in
  const box = container.getBoundingClientRect();
  const size = [box.width, box.height] || [100, 100];
  // Create a scale that maps our weights to a radius to apply to the nodes
  const radiusScale = scaleLinear().domain(weightRange).range([2, 5]);

  // Position and size our nodes
  network.nodes.forEach((n) => {
    if (!n.meta) return;
    const circle = n.meta.shape;
    circle.radius = radiusScale(maxWeight(n.value));
    circle.color = [
      random(200) / 255,
      (random(200) + 55) / 255,
      (random(200) + 55) / 255,
      1,
    ];
    circle.center = [random(size[0]), random(size[1])];

    shapeToNode.set(circle, n);
    circleShapes.push(circle);
  });

  // Position our edges
  network.edges.forEach((e) => {
    if (!e.meta) return;
    const a = e.a.meta?.shape;
    const b = e.b.meta?.shape;
    if (!a || !b) return;

    const edge = e.meta.shape;
    edge.start = a.center;
    edge.end = b.center;
    edge.control = [add2(edge.start, subtract2(edge.end, edge.start))];
    edge.startColor = copy4(a.color);
    edge.endColor = copy4(b.color);
    edge.startColor[3] = 0.2;
    edge.endColor[3] = 0.2;
    edge.thickness = [1, 1];

    shapeToEdge.set(edge, e);
    edgeShapes.push(edge);
  });

  // Handle window resizes so our display spans the container still
  let t = -1;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = window.setTimeout(() => {
      const box = container.getBoundingClientRect();
      const size = [box.width, box.height] || [100, 100];

      network.nodes.forEach((n) => {
        if (!n.meta) return;
        const circle = n.meta.shape;
        circle.center = [random(size[0]), random(size[1])];
      });

      network.edges.forEach((e) => {
        if (!e.meta) return;
        const a = e.a.meta?.shape;
        const b = e.b.meta?.shape;
        if (!a || !b) return;

        const edge = e.meta.shape;
        edge.start = a.center;
        edge.end = b.center;
        edge.control = [add2(edge.start, subtract2(edge.end, edge.start))];
      });
    }, 400);
  });

  // Track the edge's original color for mouse interactions
  const edgeToColor = new Map<EdgeInstance, [Vec4, Vec4]>();

  // Fire up a surface to render for our data we produced
  new QuickSurface({
    container,
    data: {
      edges: edgeShapes,
      circles: circleShapes,
    },
    onMouseOver: {
      circles: (info) => {
        info.instances.forEach((c: CircleInstance) => {
          console.warn(shapeToNode.get(c));
          c.radius = 10;
        });
      },

      edges: (info) => {
        info.instances.forEach((e: EdgeInstance) => {
          edgeToColor.set(e, [e.startColor, e.endColor]);
          e.startColor = [1, 1, 1, 0.4];
          e.endColor = [1, 1, 1, 0.4];
        });
      },
    },
    onMouseOut: {
      circles: (info) => {
        info.instances.forEach((c: CircleInstance) => {
          const node = shapeToNode.get(c);
          if (!node) return;
          c.radius = radiusScale(maxWeight(node.value));
        });
      },

      edges: (info) => {
        info.instances.forEach((edge: EdgeInstance) => {
          const original = edgeToColor.get(edge);
          if (!original) return;
          edge.startColor = original[0];
          edge.endColor = original[1];
        });
      },
    },
  });

  return network;
}

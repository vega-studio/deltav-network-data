import { scaleLinear } from "d3-scale";
import { add2, CircleInstance, copy4, EdgeInstance, subtract2 } from "deltav";
import { QuickSurface } from "deltav-quick-surface";
import {
  IEdge,
  INode,
  makeNetwork,
  maxWeight,
  randomEdges,
  randomNodes
} from "../../lib";
import { nodeWeightRange } from "../../lib/calculate/node-weight-range";
import { WORDS } from "../data/word-list";

const randomSeed = require("random-seed");

const random = randomSeed.create("test");
const nodes = randomNodes(WORDS, 50);
const edges = randomEdges(WORDS, nodes, 100);

export async function makeNetworkExample() {
  const container = document.getElementById("make-network-graphics");
  if (!container) return;

  // Generate the network data from the raw data we generated.
  const network = await makeNetwork({
    edgeData: edges,
    nodeData: nodes,

    nodeId: row => row.UID || "",
    edgeId: row => row.UID || "",

    nodeMeta: row => ({
      name: row.name,
      shape: new CircleInstance({
        radius: 1,
        color: [1, 1, 1, 1],
        center: [0, 0]
      })
    }),

    edgeMeta: row => ({
      name: row.name,
      shape: new EdgeInstance({
        start: [0, 0],
        end: [0, 0],
        startColor: [1, 1, 1, 1],
        endColor: [1, 1, 1, 1],
        thickness: [1, 1]
      })
    }),

    edgeA: row => row.UID_A || "",
    edgeB: row => row.UID_B || "",
    edgeValues: row => ({ ab: row.numMetric, ba: row.numMetric }),
    nodeValues: row => row.numMetric
  });

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
  const radiusScale = scaleLinear()
    .domain(weightRange)
    .range([2, 5]);

  // Position and size our nodes
  network.nodes.forEach(n => {
    if (!n.meta) return;
    const circle = n.meta.shape;
    circle.radius = radiusScale(maxWeight(n.value));
    circle.color = [
      random(200) / 255,
      (random(200) + 55) / 255,
      (random(200) + 55) / 255,
      1
    ];
    circle.center = [random(size[0]), random(size[1])];

    shapeToNode.set(circle, n);
    circleShapes.push(circle);
  });

  // Position our edges
  network.edges.forEach(e => {
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
    edge.thickness = [a.radius / 1.2, b.radius / 1.2];

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

      network.nodes.forEach(n => {
        if (!n.meta) return;
        const circle = n.meta.shape;
        circle.center = [random(size[0]), random(size[1])];
      });

      network.edges.forEach(e => {
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

  // Fire up a surface to render for our data we produced
  new QuickSurface({
    container,
    data: {
      edges: edgeShapes,
      circles: circleShapes
    },
    onMouseOver: {
      circles: info => {
        info.instances.forEach((c: CircleInstance) => (c.radius = 10));
      },

      edges: info => {
        info.instances.forEach((e: EdgeInstance) => {
          e.startColor = [1, 1, 1, 0.4];
          e.endColor = [1, 1, 1, 0.4];
        });
      }
    },
    onMouseOut: {
      circles: info => {
        info.instances.forEach((c: CircleInstance) => {
          const node = shapeToNode.get(c);
          if (!node) return;
          c.radius = radiusScale(maxWeight(node.value));
        });
      },

      edges: info => {
        info.instances.forEach((edge: EdgeInstance) => {
          const e = shapeToEdge.get(edge);
          if (!e) return;
          const a = e.a.meta?.shape;
          const b = e.b.meta?.shape;
          if (!a || !b) return;
          edge.startColor = copy4(a.color);
          edge.endColor = copy4(b.color);
          edge.startColor[3] = 0.2;
          edge.endColor[3] = 0.2;
        });
      }
    }
  });
}

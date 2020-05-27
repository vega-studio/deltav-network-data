import { FlowDirection, IEdge, INode, ReversePathMap } from "../types";
import { makeList } from "../util/make-list";
import { neighbors } from "./neighbors";

/**
 * These are the options a result callback can respond with (the result callback
 * is the result property injected in the ISplashOptions). This response can
 * alter how the spread operation proceeds.
 */
export interface IRippleResponseOptions {
  /** If this is set, this causes the spread operation to cease. */
  stop?: boolean;
}

/**
 * These are results that can be provided by the splash per each ripple. The
 * contents of results will ALWAYS have nodes and edges. Other metrics may
 * only be available depending on the options provided to the splash.
 */
export interface IRippleResult<TNodeMeta, TEdgeMeta> {
  /**
   * This provides how deep the current set of nodes are from their nearest
   * splash source. Depth of 0 IS the splash source node, depth of one is the
   * neighbors of the splash source, depth of 2 is the neighbor's neighbors, etc
   * etc.
   */
  depth: number;
  /** All found edges in this execution layer */
  edges: IEdge<TNodeMeta, TEdgeMeta>[];
  /** All found nodes in this execution layer */
  nodes: INode<TNodeMeta, TEdgeMeta>[];

  /**
   * This is available when includeCollisions is set in the Splash Options.
   * When a splash is made with multiple points of origin, the ripples emanating
   * out can encounter a node at the exact same depth. These nodes often need to
   * be resolved for certain scenarios, and in many scenarios, represent
   * something very special when examining a network.
   *
   * The map is a tracker of a node that has a collision to the nodes
   * that preceded the collision.
   */
  nodeCollisions?: Map<
    INode<TNodeMeta, TEdgeMeta>,
    INode<TNodeMeta, TEdgeMeta>[]
  >;

  /**
   * This is available when includeCollisions is set in the Splash Options. When
   * a splash is made with multiple points of origin, the ripples emanating out
   * can encounter an edge at the exact same depth. These edges often need to be
   * resolved for certain scenarios, and in many scenarios, represent something
   * very special when examining a network.
   *
   * An edge has the only nodes that could have preceded the collision, so this
   * collision set is merely a set of the edges discovered to be marked as a
   * collision.
   */
  edgeCollisions?: Set<IEdge<TNodeMeta, TEdgeMeta>>;

  /**
   * If the splash set the includePath flag, then this is populated with a node's
   * previously found item during the ripples previous wave. If you keep
   * recursively searching for a parent, you will eventually get to the
   * originating node. The originating node will then have no parent and return
   * undefined if searched for in this path.
   *
   * NOTE: You MUST have includeCollisions if you want to resolve equi-distant
   * paths to a node from multiple splash sources. This will only store the path
   * for the node from a source for a ripple that FIRST encounters the node. The
   * collision information allows you to analyze all nodes one step before the
   * collision happened so you can trace all directions the collision originated
   * from.
   */
  path?: ReversePathMap<TNodeMeta, TEdgeMeta>;

  /**
   * If the splash options specified includeSource, this will be populated with
   * a map that links a node to the nearest splash node.
   *
   * It should be noted: a node may be equal distant from two splash nodes, if
   * this is a concern for the operation you are carrying out, then you should
   * includeCollisions in your splash options, which will allow you to resolve
   * those scenarios.
   */
  source?: Map<INode<TNodeMeta, TEdgeMeta>, INode<TNodeMeta, TEdgeMeta>>;
}

/**
 * The handler type for handling results found from ripples.
 */
export type IRippleResultHandler<TNodeMeta, TEdgeMeta> = (
  data: IRippleResult<TNodeMeta, TEdgeMeta>
) => Promise<IRippleResponseOptions | null | undefined | void>;

/**
 * This describes how a splash operation prioritizes it's operations as it's
 * ripples interact with other ripples taking place at the same time.
 */
export enum RipplePriority {
  /** Will execute on nodes that have been visited by other ripples */
  BLENDS,
  /**
   * Will execute on nodes that have been visited by previous ripples and
   * prevent those ripples from executing on any node this has executed on.
   */
  OVERRIDES,
  /**
   * Will not execute on a visited node and will stop rippling from that point,
   * but will continue on nodes that have not encountered other ripples.
   */
  TERMINATES,
  /**
   * Once a visited node is discovered, all ripples started by the splash quits.
   */
  COMPLETELY_TERMINATES,
  /**
   * When this hits a visited node of another ripple, it will immediately cancel
   * the ripples that have visited that node.
   */
  TERMINATES_OTHERS,
}

/**
 * These are the options you can inject for creating a splash.
 */
export interface ISplashOptions<TNodeMeta, TEdgeMeta> {
  /**
   * Set this to remove edges that connect two nodes that have the same depth
   * level from the splash location.
   */
  excludeSameDepthEdges?: boolean;
  /**
   * When this is set, if you specify multiple startNodes, you will get ripples
   * that encounter nodes at the exact same depth. We call these points
   * collisions and will be provided in the results of the splash callback.
   *
   * Additionally, it is possible a collision will happen at an edge instead of
   * a node. This is the same principle as a node collision except this is a
   * special case where the ripples will have crossed at the same time at the
   * edge thus not triggering a collision at the edge's two end nodes.
   *
   * Though implied, I will explicitly state here: COLLISIONS ONLY HAPPEN WITHIN
   * THE SAME SPLASH. Multiple splashes will NOT cause collisions, only a splash
   * with MULTIPLE start points will cause collisions.
   *
   * These are special case nodes and represent points of VERY HIGH interest
   * when examining a network. These collisions, combined with pathing can give
   * shortest path results and many other interesting insights.
   */
  includeCollisions?: boolean;
  /**
   * When this is set, the result will provide a map of a node to the nearest
   * splash point that caused the node to get aggregated.
   */
  includeSource?: boolean;
  /**
   * If this is set to true, then an additional result property will be created
   * that will provide a path that returns to the originating node.
   */
  includePath?: boolean;
  /**
   * This specifies how ripples should travel from node to node. You can limit
   * the outward propagation to travel only via outgoing or incoming edges.
   * By default it propagates via any edge connection.
   */
  flow?: FlowDirection;
  /**
   * Specifies how a spread operation will interact with existing spread
   * operations. By default, the ripple will RipplePriority.BLEND with other
   * ripples.
   */
  priority?: RipplePriority;
  /**
   * When set to true, this causes this spread operation to wait for all other
   * layer executions to complete a cycle before this spread operation
   * continues.
   */
  waitsForLayers?: boolean;
  /**
   * When specified, this limits how deep into the network the spread will go
   * from the input start nodes. Depth is an integer where depth 0 is the start
   * node and each subsequent neighbor node is 1 depth farther.
   */
  maxDepth?: number;
  /**
   * When specified, this limits how many nodes can be aggregated at once while
   * spreading out.
   */
  maxNodesPerExecution?: number;
  /**
   * These are the nodes you essentially throw a rock at to make a splash. The
   * ripples made will start at these nodes and radiate away from those nodes,
   * collecting all nodes and edges it encounters along the way in the fashion
   * the configuration specifies.
   */
  startNodes: INode<TNodeMeta, TEdgeMeta> | INode<TNodeMeta, TEdgeMeta>[];
}

/**
 * This stores current state of the ripples created from a splash.
 *
 * TODO OPTIMIZATION CONSIDERATIONS:
 * - A thought occurred to me that as ripples propagate out, there is no need
 *   to store ALL visited nodes in certain conditions
 */
class Ripples<TNodeMeta, TEdgeMeta> {
  /** This indicates if the ripple is still propagating or not */
  isAlive: boolean = true;
  /**
   * For some operations we need to track a node that has been scooped up in a
   * wave back to the source node the wave started from.
   */
  private nodeToSource?: Map<
    INode<TNodeMeta, TEdgeMeta>,
    INode<TNodeMeta, TEdgeMeta>
  >;
  /** These are the options that created these ripples */
  private options: ISplashOptions<TNodeMeta, TEdgeMeta>;
  /**
   * When this is set, these ripples will keep a log of node to parent node
   * which builds a path back to the epicenter of where the splash for the
   * ripple started.
   */
  private path?: Map<INode<TNodeMeta, TEdgeMeta>, INode<TNodeMeta, TEdgeMeta>>;
  /** This is our handler that results are passed off to */
  private sendResult: IRippleResultHandler<TNodeMeta, TEdgeMeta>;
  /**
   * This is the node visitation set that specifies which nodes have been
   * visited, which helps aid in the next wave to pick the next nodes without
   * picking already processed nodes.
   */
  private visitedNodes = new Set<INode<TNodeMeta, TEdgeMeta>>();
  /**
   * This is the edge visitation set that specifies which edges have been
   * visited, which helps aid in the next wave to pick the next edges without
   * picking already processed edges.
   */
  private visitedEdges = new Set<IEdge<TNodeMeta, TEdgeMeta>>();
  /**
   * This is the list of nodes that will next be processed as the ripples
   * emanate out.
   */
  private waveFront: INode<TNodeMeta, TEdgeMeta>[] = [];
  /**
   * This tracks how deep the wave front has progressed (how many times wave)
   * has been called.
   */
  private waveFrontDepth: number = 0;

  /**
   * This promise resolves when the ripples have resolved
   */
  finished: Promise<void>;
  /** Resolver for the finished promise */
  private resolveFinish: Function;

  constructor(
    options: ISplashOptions<TNodeMeta, TEdgeMeta>,
    sendResult: IRippleResultHandler<TNodeMeta, TEdgeMeta>
  ) {
    this.options = options;
    this.sendResult = sendResult;
  }

  /**
   * Stops the ripples from continuing any farther, kills all ripples and cleans
   * up any memory no longer needed after the stop has occurred.
   */
  private stop() {
    this.isAlive = false;
    this.visitedEdges.clear();
    this.visitedNodes.clear();
    this.resolveFinish();
  }

  /**
   * This examines a response generated from broadcasting a result and applies
   * the response to the state of the ripple.
   *
   * This returns the current alive state of the process.
   */
  private processResultResponse(
    response?: IRippleResponseOptions | null | void
  ): boolean {
    if (!response) return this.isAlive;

    // The response can provide a stop signal to cause the ripple to abruptly
    // end.
    if (response.stop) {
      this.stop();
    }

    return this.isAlive;
  }

  /**
   * Start up the ripples and perform first wave actions as needed
   */
  async init(): Promise<boolean> {
    if (this.finished) return this.isAlive;
    // Make our new promise that will resolve when this ripple sequence has
    // completed entirely.
    this.finished = new Promise<void>((r) => (this.resolveFinish = r));

    const {
      startNodes,
      includeCollisions,
      includeSource,
      includePath,
    } = this.options;

    // We check our start points and strip out any duplicates
    const checkStartPoints = new Set<INode<TNodeMeta, TEdgeMeta>>();
    const start = makeList(startNodes);

    for (let i = 0, iMax = start.length; i < iMax; ++i) {
      const node = start[i];

      if (checkStartPoints.has(node)) {
        console.warn(
          "Duplicate start points detected for a Splash. Duplicates will be stripped out."
        );
        continue;
      }

      this.visitedNodes.add(node);
      this.waveFront.push(node);
    }

    // In certain cases we need to track a node that has been gathered by a wave
    // front back to the Ripples source node.
    if (includeCollisions || includeSource) {
      this.nodeToSource = new Map<
        INode<TNodeMeta, TEdgeMeta>,
        INode<TNodeMeta, TEdgeMeta>
      >();

      // Each of these nodes IS the node source, so we flag them as such
      for (let i = 0, iMax = this.waveFront.length; i < iMax; ++i) {
        const node = this.waveFront[i];
        this.nodeToSource.set(node, node);
      }
    }

    // If the splash options specifies that pathing should be tracked for the
    // ripple as it propagates, then we generate the path object to store the
    // parent relationship to the nodes generated.
    // We also need the path for collision calculations so we can keep track of
    // previous node elements before the collision happens
    if (includePath || includeCollisions) {
      this.path = new Map();
    }

    // On initialization we must immediately broadcast the first nodes as the
    // beginning of our ripple.
    const response = await this.sendResult({
      depth: this.waveFrontDepth,
      nodes: this.waveFront,
      nodeCollisions: this.options.includeCollisions ? new Map() : undefined,
      edges: [],
      edgeCollisions: this.options.includeCollisions ? new Set() : undefined,
      path: this.path,
      source: this.nodeToSource,
    });

    // Process our result
    this.processResultResponse(response);

    return this.isAlive;
  }

  /**
   * This executes the next wave for the ripple. When this returns false, the
   * ripple has completed and won't propagate no matter how many times you call
   * it.
   */
  async wave(): Promise<boolean> {
    // Dead ripples don't wave.
    if (
      !this.isAlive ||
      this.waveFrontDepth > (this.options.maxDepth || Number.MAX_SAFE_INTEGER)
    ) {
      return false;
    }

    // This is the next depth layer of wave
    this.waveFrontDepth++;

    // Check wave depth after incrementing
    if (
      this.waveFrontDepth > (this.options.maxDepth || Number.MAX_SAFE_INTEGER)
    ) {
      this.stop();
      return false;
    }

    // This will aggregate all of the next nodes for the next wave front once
    // this wave front has been processed and cleaned out.
    const nextWaveFront = new Set<INode<TNodeMeta, TEdgeMeta>>();
    // This will aggregate the edges to include in the result
    const edges = new Set<IEdge<TNodeMeta, TEdgeMeta>>();

    // Get the configuration of the splash for handling our wave behavior
    const {
      includeCollisions,
      excludeSameDepthEdges,
      flow,
      includePath,
    } = this.options;

    // If we specify the need for collisions, then we create our node
    // collision output object
    let nodeCollisions: IRippleResult<TNodeMeta, TEdgeMeta>["nodeCollisions"];
    if (includeCollisions) {
      nodeCollisions = new Map();
    }

    // If we specify the need for collisions, then we create our edge
    // collision output object
    let checkForEdgeCollisions: Set<IEdge<TNodeMeta, TEdgeMeta>> | undefined;
    let edgeCollisions: IRippleResult<TNodeMeta, TEdgeMeta>["edgeCollisions"];
    if (includeCollisions) {
      edgeCollisions = new Set();
      checkForEdgeCollisions = new Set();
    }

    // Process all nodes in the current wave front to find their next neighbors
    for (let i = 0, iMax = this.waveFront.length; i < iMax; ++i) {
      const node = this.waveFront[i];
      let nodeSource: INode<TNodeMeta, TEdgeMeta> | undefined;

      // This is technically an error, but we will just continue and see what
      // happens
      if (!node) {
        console.warn(`
          Error: A wave front contained an undefined node which should not be possible.
          This is either an error in the ripple select code base or the input network
          has an invalid configuration.
        `);
        continue;
      }

      // If we're tracking a node back to it's source, then we must get this
      // node's source so it can be passed along to it's newfound neighbors.
      if (this.nodeToSource) {
        nodeSource = this.nodeToSource.get(node);
      }

      // Gather the neighbors of this node to add to our next wave front
      const siblings = neighbors({
        node,
        exclude: this.visitedNodes,
        includeEdgeToExcludedNode: true,
        includeExcludedNodes: includeCollisions,
        includeEdgeForCircularReference: !excludeSameDepthEdges,
        flow,
      });

      // Add those neighbors into our next processing queue
      for (let i = 0, iMax = siblings.nodes.length; i < iMax; ++i) {
        const child = siblings.nodes[i];
        nextWaveFront.add(child);
        this.visitedNodes.add(child);

        // If we are tracking back to the node source, then we need to register
        // this neighboring node found with it's parent's node's node source so
        // we can back track this node to the ripple epicenter that generated
        // this part of the wave front.
        if (this.nodeToSource && nodeSource) {
          this.nodeToSource.set(child, nodeSource);
        }

        // If we need to track the path we took to reach this node, we store the
        // processed node as the parent and the neighbor node as the key
        // reference to find the parent.
        if (this.path) {
          this.path.set(child, node);
        }
      }

      // If we include collisions, then we need to analyze our neighbor
      // calculation's excluded nodes against our current wavefront. If the
      // node was excluded as a result of the current wave front, then we know
      // the node was a collision from ripples created in the same splash.
      if (
        nodeSource &&
        nodeCollisions &&
        this.path &&
        this.nodeToSource &&
        siblings.excluded
      ) {
        // Store properties in this context that are not undefined so we know
        // they are valid for the duration of the loop through the exclusions
        // set
        const collisions = nodeCollisions;
        const currentSource = nodeSource;
        const nodeToSource = this.nodeToSource;
        const path = this.path;

        siblings.excluded.forEach((excludedNode) => {
          // If the nextWaveFront has this exlcuded node, then we have
          // detected a collision
          if (nextWaveFront.has(excludedNode)) {
            let collisionSources = collisions.get(excludedNode);

            // If the node already has a collision, then we just need to add
            // this node's source to the collisions that have happened
            if (collisionSources) {
              collisionSources.push(node);
            }

            // Otherwise, this collision is new and neither node has been
            // entered as a collision. So we must add this node source AND the
            // collided node's currently registered node source to make our
            // new collision entry
            else {
              // Get the node source that first discovered this node
              const collidedNodeSource = nodeToSource.get(excludedNode);
              // Get the node that preceded this collided node
              const collidedEntryNode = path.get(excludedNode);

              if (!collidedEntryNode) {
                console.warn(
                  "A new Node Collision was detected, but an exisiting source node was NOT found",
                  "for the node collided with. This could indicate a malformed data structure",
                  "or a bug was found in this selection algorithm."
                );
                return;
              }

              if (!collidedNodeSource) {
                console.warn(
                  "A new Node Collision was detected, but an exisiting source node was NOT found",
                  "for the node collided with. This could indicate a malformed data structure",
                  "or a bug was found in this selection algorithm."
                );
                return;
              }

              // Collisions can't happen from the same source colliding
              if (currentSource !== collidedNodeSource) {
                collisionSources = [node, collidedEntryNode];
                collisions.set(excludedNode, collisionSources);
              }
            }
          }
        });
      }

      // These are the sibling's edges included in the results
      for (let k = 0, kMax = siblings.edges.length; k < kMax; ++k) {
        const edge = siblings.edges[k];

        if (!this.visitedEdges.has(edge)) {
          edges.add(edge);
          this.visitedEdges.add(edge);
        }
      }

      // If the same depth edging is included, then we will add in those to our
      // output, also use these special case edges to detect collisions between
      // ripples.
      if (siblings.edgeToExclusion) {
        // If we are checking for collisions, we perform a few additional checks
        // when processing our edge exclusions
        if (checkForEdgeCollisions && edgeCollisions && this.nodeToSource) {
          for (
            let k = 0, kMax = siblings.edgeToExclusion.length;
            k < kMax;
            ++k
          ) {
            const edge = siblings.edgeToExclusion[k];

            if (!excludeSameDepthEdges) {
              if (!this.visitedEdges.has(edge)) {
                edges.add(edge);
                this.visitedEdges.add(edge);
              }
            }

            // If our check for collision has an existing edge, then this is a
            // collision at this edge. The reason for this is slightly
            // complicated and requires some step by step considerations:
            // - A wavefront that is close enough to itself, where two nodes in
            //   the same front are separated by a mere edge, will attempt to
            //   gather each other in the neighbor selection, but both nodes
            //   will consider each other as excluded, thus both nodes will add
            //   the edge to the edge for exclusions list.
            // - A single wavefront being processed will ONLY have this double
            //   edge addition because every node in a wave front is unique. It
            //   is impossible with a unique node set to gather the same edge
            //   due to exclusion UNLESS the nodes are neighbors AND in the same
            //   wave.
            // - These assumptions have one additional check of making sure the
            //   two nodes come from different sources.
            if (checkForEdgeCollisions.has(edge) && !edgeCollisions.has(edge)) {
              const nodeSourceA = this.nodeToSource.get(edge.a);
              const nodeSourceB = this.nodeToSource.get(edge.b);

              if (!nodeSourceA || !nodeSourceB) {
                continue;
              }

              if (nodeSourceA !== nodeSourceB) {
                edgeCollisions.add(edge);
              }
            } else {
              checkForEdgeCollisions.add(edge);
            }
          }
        }

        // If no collisions needed, then simply add the same depth edges if needed
        else if (!excludeSameDepthEdges) {
          for (
            let k = 0, kMax = siblings.edgeToExclusion.length;
            k < kMax;
            ++k
          ) {
            const edge = siblings.edgeToExclusion[k];

            if (!this.visitedEdges.has(edge)) {
              edges.add(edge);
              this.visitedEdges.add(edge);
            }
          }
        }
      }
    }

    // Make our newly discovered wavefront the current wave front of the ripple
    this.waveFront = makeList(nextWaveFront);
    // Convert our output edge set to a list
    const outEdges = makeList(edges);

    // Hand the results to the caller and wait for a response. Execution halts
    // until the caller responds.
    const response = await this.sendResult({
      depth: this.waveFrontDepth,
      edges: outEdges,
      nodes: this.waveFront,
      path: includePath ? this.path : undefined,
      source: this.nodeToSource,
      nodeCollisions,
      edgeCollisions,
    });

    // Analyze the response for feedback on what to do next
    this.processResultResponse(response);

    // We can now fire up the next layer of execution if needed
    if (this.waveFront.length > 0) this.wave();
    // If there is no longer a wave front, then we fully stop the ripple
    else {
      this.stop();
    }

    return this.isAlive;
  }
}

/**
 * Think of your nodes and edges like a pool of water. If you throw a rock in
 * it, it will create a splash. From that splash you will see ripples emanate
 * out. There are probably more technical definitions of this style of
 * traversing a network graph; however, this analogy is the easiest to
 * conceptualize and thus is how i'm encapsulating the concept.
 *
 * With this selection you create a 'splash' point (A node or a list of
 * nodes). From those points, using the edges as guides, nodes will be collected
 * and continue to be collected until the criteria for the splash is met or
 * until all nodes have been processed.
 *
 * This manages overlapping ripples. You can create multiple 'splashes' whose
 * ripples interact with each other in interesting ways. Each splash can have
 * multiple splash origins thus creating multiple ripples per splash.
 *
 * The interactions can get complex as they all emanate out, so this manager
 * helps simplify those interactions.
 */
export class RippleSelect {
  rippleLayers: Ripples<any, any>[] = [];
  finished?: Promise<void>;

  /**
   * The rippleResult callback provides the results the ripple discovers as it
   * finds each new wave of nodes and edges.
   *
   * The next wave of the ripple will NOT execute until a response is returned.
   * This provides a means to control how quickly the spread operation occurs
   * and how much resources the ripple will control at any given moment.
   *
   * Example that makes each ripple wave execute after every frame:
   *
   * ```
   * async (data) => {
   *   await onFrame(); return {};
   * }
   * ```
   *
   * When the results are provided, you have an opportunity to control several
   * aspects of the ripple in it's current state, such as, cancel the
   * operation, delay the next wave, and much more as new features are added.
   */
  splash<TNodeMeta, TEdgeMeta>(
    options: ISplashOptions<TNodeMeta, TEdgeMeta>,
    rippleResults: IRippleResultHandler<TNodeMeta, TEdgeMeta>
  ) {
    const ripples = new Ripples(options, rippleResults);
    ripples.init();
    ripples.wave();

    return ripples.finished;
  }
}

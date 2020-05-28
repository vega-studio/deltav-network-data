import { AnalyzeNodes, FlowDirection, IEdge, INode, ReversePathMap } from "../types";
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
    nodeCollisions?: Map<INode<TNodeMeta, TEdgeMeta>, INode<TNodeMeta, TEdgeMeta>[]>;
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
export declare type IRippleResultHandler<TNodeMeta, TEdgeMeta> = (data: IRippleResult<TNodeMeta, TEdgeMeta>) => Promise<IRippleResponseOptions | null | undefined | void>;
/**
 * This describes how a splash operation prioritizes it's operations as it's
 * ripples interact with other ripples taking place at the same time.
 */
export declare enum RipplePriority {
    /** Will execute on nodes that have been visited by other ripples */
    BLENDS = 0,
    /**
     * Will execute on nodes that have been visited by previous ripples and
     * prevent those ripples from executing on any node this has executed on.
     */
    OVERRIDES = 1,
    /**
     * Will not execute on a visited node and will stop rippling from that point,
     * but will continue on nodes that have not encountered other ripples.
     */
    TERMINATES = 2,
    /**
     * Once a visited node is discovered, all ripples started by the splash quits.
     */
    COMPLETELY_TERMINATES = 3,
    /**
     * When this hits a visited node of another ripple, it will immediately cancel
     * the ripples that have visited that node.
     */
    TERMINATES_OTHERS = 4
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
    startNodes: AnalyzeNodes<TNodeMeta, TEdgeMeta>;
}
/**
 * This stores current state of the ripples created from a splash.
 *
 * TODO OPTIMIZATION CONSIDERATIONS:
 * - A thought occurred to me that as ripples propagate out, there is no need
 *   to store ALL visited nodes in certain conditions
 */
declare class Ripples<TNodeMeta, TEdgeMeta> {
    /** This indicates if the ripple is still propagating or not */
    isAlive: boolean;
    /**
     * For some operations we need to track a node that has been scooped up in a
     * wave back to the source node the wave started from.
     */
    private nodeToSource?;
    /** These are the options that created these ripples */
    private options;
    /**
     * When this is set, these ripples will keep a log of node to parent node
     * which builds a path back to the epicenter of where the splash for the
     * ripple started.
     */
    private path?;
    /** This is our handler that results are passed off to */
    private sendResult;
    /**
     * This is the node visitation set that specifies which nodes have been
     * visited, which helps aid in the next wave to pick the next nodes without
     * picking already processed nodes.
     */
    private visitedNodes;
    /**
     * This is the edge visitation set that specifies which edges have been
     * visited, which helps aid in the next wave to pick the next edges without
     * picking already processed edges.
     */
    private visitedEdges;
    /**
     * This is the list of nodes that will next be processed as the ripples
     * emanate out.
     */
    private waveFront;
    /**
     * This tracks how deep the wave front has progressed (how many times wave)
     * has been called.
     */
    private waveFrontDepth;
    /**
     * This promise resolves when the ripples have resolved
     */
    finished: Promise<void>;
    /** Resolver for the finished promise */
    private resolveFinish;
    constructor(options: ISplashOptions<TNodeMeta, TEdgeMeta>, sendResult: IRippleResultHandler<TNodeMeta, TEdgeMeta>);
    /**
     * Stops the ripples from continuing any farther, kills all ripples and cleans
     * up any memory no longer needed after the stop has occurred.
     */
    private stop;
    /**
     * This examines a response generated from broadcasting a result and applies
     * the response to the state of the ripple.
     *
     * This returns the current alive state of the process.
     */
    private processResultResponse;
    /**
     * Start up the ripples and perform first wave actions as needed
     */
    init(): Promise<boolean>;
    /**
     * This executes the next wave for the ripple. When this returns false, the
     * ripple has completed and won't propagate no matter how many times you call
     * it.
     */
    wave(): Promise<boolean>;
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
export declare class RippleSelect {
    rippleLayers: Ripples<any, any>[];
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
    splash<TNodeMeta, TEdgeMeta>(options: ISplashOptions<TNodeMeta, TEdgeMeta>, rippleResults: IRippleResultHandler<TNodeMeta, TEdgeMeta>): Promise<void>;
}
export {};

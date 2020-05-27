/**
 * This depicts all values that evaluate to false.
 */
export type Falsy = false | 0 | "" | null | undefined;

/**
 * This ensures a value is defined (does not use falsey so passes 0's and empty
 * strings)
 */
export function isDefined<T>(val?: T | null): val is T {
  return !(val === void 0 || val === null);
}

/**
 * A numerical expression of value or values for metrics within the network data
 */
export type Weights = number | number[];

/**
 * Typeguard to ensure value is a Weights type.
 */
export function isWeights(val: any): val is Weights {
  return val && (val.toFixed || Array.isArray(val));
}

/**
 * Typeguard to ensure value is a weight value object that defines weights for
 * an edge
 */
export function isEdgeWeights(val: any): val is { ab: Weights; ba: Weights } {
  return val && isWeights(val.ab) && isWeights(val.ba);
}

/**
 * Typeguard to ensure value is a single number and not a list
 */
export function isWeightNumber(val: Weights): val is number {
  return (val as number).toFixed !== void 0;
}

/**
 * This is the expected value that an identifier should be. Number identifiers
 * perform better.
 */
export type Identifier = number | string;

/**
 * Typeguard to ensure a value is an identifier
 */
export function isIdentifier(val: any): val is Identifier {
  return val && (val.toFixed || val.substring);
}

/**
 * Typeguard for identifiers to determine if it's a string or not
 */
export function isIdentifierString(val: Identifier): val is string {
  return Boolean((val as any).substring);
}

/**
 * Defines a method or string accessor to retrieve a property. Accessors are
 * also able to access multiples of the same properties.
 */
export type Accessor<TSource, TReturn, TMeta> =
  | ((item: TSource, meta?: TMeta) => TReturn)
  | keyof TSource;

/**
 * Typeguard for Accessors to determine if it's a simple string access or the
 * method access
 */
export function isAccessorString<T, U, V>(
  val: Accessor<T, U, V>
): val is keyof T {
  return Boolean((val as any).substring);
}

/**
 * An edge represents a path between two nodes and can express value to either
 * direction the edge flows. An edge requires nodes to exist.
 */
export interface IEdge<TNodeMeta, TEdgeMeta> {
  /**
   * A unique identifier for the edge. A number is preferred for performance and
   * reduced RAM
   */
  id: Identifier;
  /** One of the nodes the edge connects */
  a: INode<TNodeMeta, TEdgeMeta>;
  /** Another node the edge can connect */
  b: INode<TNodeMeta, TEdgeMeta>;
  /** The value flowing from node a to node b */
  atob: Weights;
  /** The value flowing from node b to node a */
  btoa: Weights;
  /** Meta information that can be associated with the Edge */
  meta?: TEdgeMeta;
}

/**
 * Typeguard to distinguish between Edges vs Nodes
 */
export function isEdge<TNodeMeta, TEdgeMeta>(
  val?: INode<TNodeMeta, TEdgeMeta> | IEdge<TNodeMeta, TEdgeMeta>
): val is IEdge<TNodeMeta, TEdgeMeta> {
  return val && (val as any).a && (val as any).b;
}

/**
 * An edge who has it's structure locked, but it's values are modifiable.
 */
export interface ILockedEdge<TNodeMeta, TEdgeMeta> {
  /**
   * A unique identifier for the edge. A number is preferred for performance and
   * reduced RAM
   */
  readonly id: Identifier;
  /** One of the nodes the edge connects */
  readonly a: INode<TNodeMeta, TEdgeMeta>;
  /** Another node the edge can connect */
  readonly b: INode<TNodeMeta, TEdgeMeta>;
  /** The value flowing from node a to node b */
  atob: Weights;
  /** The value flowing from node b to node a */
  btoa: Weights;
  /** Meta information that can be associated with the Edge */
  meta?: TEdgeMeta;
}

/**
 * A node represents a data point with a distinct value that can exist as itself
 * that can be connected to other nodes.
 */
export interface INode<TNodeMeta, TEdgeMeta> {
  /**
   * A unique identifier for the node. A number is preferred for performance and
   * reduced RAM
   */
  id: Identifier;
  /**
   * The edges that connects this node to other nodes where edge.b === this node
   */
  in: IEdge<TNodeMeta, TEdgeMeta>[];
  /** Meta information that can be associated with the Node */
  meta?: TNodeMeta;
  /**
   * The edges that connects this node to other nodes where edge.a === this node
   */
  out: IEdge<TNodeMeta, TEdgeMeta>[];
  /** The values that this node harbors */
  value: Weights;
}

/**
 * Typeguard to distinguish between Edges vs Nodes
 */
export function isNode<TNodeMeta, TEdgeMeta>(
  val?: INode<TNodeMeta, TEdgeMeta> | IEdge<TNodeMeta, TEdgeMeta>
): val is INode<TNodeMeta, TEdgeMeta> {
  return val && (val as any).in && (val as any).out;
}

/**
 * This is the proper data structure for Networked Data.
 */
export interface INetworkData<TNodeMeta, TEdgeMeta> {
  /** The new node format created for all of the node information */
  nodes: INode<TNodeMeta, TEdgeMeta>[];
  /** The lookup used to identify nodes by their identifier */
  nodeMap: Map<Identifier, INode<TNodeMeta, TEdgeMeta>>;
  /** The new edge format created for all of the edge information */
  edges: IEdge<TNodeMeta, TEdgeMeta>[];
  /** The lookup used to identify edges by their identifier */
  edgeMap: Map<Identifier, IEdge<TNodeMeta, TEdgeMeta>>;
  /**
   * This is a lookup to quickly find existing connections. This only maps
   * unidirectionally where you always have to check a to b. Checking b to a
   * would be considered undefined behavior for this list. We do not store btoa
   * as it would be redundant and a waste of RAM. If you check nodeA to nodeB
   * for a connection but do not find one, simply reverse the check with this
   * look up nodeB to nodeA to see if the connection exists.
   */
  atobMap: Map<
    INode<TNodeMeta, TEdgeMeta>,
    Map<INode<TNodeMeta, TEdgeMeta>, IEdge<TNodeMeta, TEdgeMeta>>
  >;
}

/**
 * Represents a highly generic object with any type of value. This should be
 * used primarily to help define generic interfaces.
 */
export type PartialObject = { [key: string]: any };

/**
 * These are the type of errors you will encounter while processing the data.
 */
export enum MakeNetworkErrorType {
  /** An identifier happened that is invalid */
  BAD_ID,
  /**
   * A lookup for a node happened, and there was no node found with the
   * calculated identifier
   */
  NODE_NOT_FOUND,
  /**
   * Two nodes were found with the same identifier. The most recent node will
   * be the node preserved
   */
  DUPLICATE_NODE_ID,
  /**
   * Two edges were found with the same identifier. The most recent edge will
   * be the node preserved
   */
  DUPLICATE_EDGE_ID,
  /** System failure made an unknown type error */
  UNKNOWN,
}

/**
 * This is the structure for an error message from the system.
 */
export interface IMakeNetworkError<T, U> {
  /** The error type discovered */
  error: MakeNetworkErrorType;
  /** The data source items that were the culprits in causing the error */
  source: T | U | T[] | U[] | (T | U)[];
  /** A readable message to explain the cause of the error */
  message: string;
}

/**
 * This is the expected result output from the make network operation.
 */
export interface IMakeNetworkResult<T, U, TNodeMeta, TEdgeMeta>
  extends INetworkData<TNodeMeta, TEdgeMeta> {
  /** All errors discovered while processing the data from old to new format */
  errors: IMakeNetworkError<T, U>[] | null;
}

/**
 * This decribes directionality of how an edge relates to a node. Either
 * outgoing where the edge's a === the node or incoming where the
 * edge's b === the node.
 */
export enum FlowDirection {
  BOTH = 0,
  OUT,
  IN,
}

/**
 * This depicts paths that are generated via chained nodes. The Path is built in
 * reverse, so getting the next node from the map will be the previous step in
 * the path. If you get a node from the map and it returns undefined, the input
 * node is the beginning of the path or is not a part of any known path in this
 * map object.
 */
export type ReversePathMap<TNodeMeta, TEdgeMeta> = Map<
  INode<TNodeMeta, TEdgeMeta>,
  INode<TNodeMeta, TEdgeMeta>
>;

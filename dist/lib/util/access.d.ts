import { Accessor } from "../types";
/**
 * Uses an accessor to access a chunk of data
 */
export declare function access<T, U, V>(data: T, accessor: Accessor<T, U, V> | undefined, guard: (val: any) => val is U, meta?: V): U | null;

import { IMakeNetworkError, MakeNetworkErrorType } from "../types";
/**
 * Handles generating and suppressing an error.
 */
export declare function makeError<T, U>(suppress: Set<MakeNetworkErrorType>, errors: IMakeNetworkError<T, U>[], error: IMakeNetworkError<T, U>): void;

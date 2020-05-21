import { IMakeNetworkError, MakeNetworkErrorType } from "../types";

/**
 * Handles generating and suppressing an error.
 */
export function makeError<T, U>(
  suppress: Set<MakeNetworkErrorType>,
  errors: IMakeNetworkError<T, U>[],
  error: IMakeNetworkError<T, U>
) {
  if (suppress.has(error.error)) return;
  errors.push(error);
}

export function mapError(error: unknown): Error {
  return error instanceof Error
    ? error
    : new Error('Unknown error', { cause: error });
}

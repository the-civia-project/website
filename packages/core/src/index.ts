import { mapError } from './errors.ts';
import { Result } from './result.ts';

export * from './errors.ts';
export * from './result.ts';
export * from './env.ts';
export * from './worker.ts';

export const safeJsonParse = (str: string): Result<unknown, Error> => {
  try {
    return {
      success: true,
      value: JSON.parse(str),
    };
  } catch (e) {
    return {
      success: false,
      error: mapError(e),
    };
  }
};

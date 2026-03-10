import { z } from 'zod';

export class EnvValidationError extends Error {
  public readonly issues: unknown;

  constructor(message: string, issues: unknown) {
    super(message);
    this.name = 'EnvValidationError';
    this.cause = { issues };
  }
}

/**
 * Validates `process.env` against a Zod schema and throws on failure.
 *
 * Use at process initialization time to fail fast when required env vars are missing.
 */
export function validateEnvOrThrow<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  options?: {
    /**
     * Allows overriding env source for tests.
     * Defaults to the real `process.env`.
     */
    env?: NodeJS.ProcessEnv;
  },
): z.infer<TSchema> {
  const env = options?.env ?? process.env;
  const parsed = schema.safeParse(env);

  if (parsed.success) {
    return parsed.data;
  }

  // Avoid deprecated Zod APIs; keep a compact, log-friendly representation.
  const issues = parsed.error.issues.map((issue) => ({
    path: issue.path.map(String).join('.'),
    message: issue.message,
    code: issue.code,
  }));

  throw new EnvValidationError('Invalid environment configuration', issues);
}

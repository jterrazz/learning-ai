import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';

const currencyParamSchema = z
    .string()
    .optional()
    .transform((val) => val?.toUpperCase());

/**
 * Schema for validating HTTP input parameters for GET /accounts endpoint
 * Transforms raw input directly to domain value objects
 */
const getAccountsParamsSchema = z.object({
    currency: currencyParamSchema,
});

export type HttpGetAccountsParams = z.infer<typeof getAccountsParamsSchema>;

/**
 * Handles HTTP request validation and transformation for GET /accounts endpoint
 * Transforms raw HTTP input to validated domain objects
 */
export class GetAccountsRequestHandler {
    /**
     * Validates and transforms raw HTTP query parameters to domain objects
     *
     * @param rawQuery - Raw HTTP query parameters
     * @returns Validated and transformed parameters
     * @throws HTTPException with 422 status for validation errors
     */
    handle(rawQuery: unknown): HttpGetAccountsParams {
        const validatedParams = getAccountsParamsSchema.safeParse(rawQuery);

        if (!validatedParams.success) {
            throw new HTTPException(422, {
                cause: { details: validatedParams.error.issues },
                message: 'Invalid request parameters',
            });
        }

        return validatedParams.data;
    }
}

import { captureException } from "@sentry/nextjs";

import { ApiError, InternalServerError, ValidationError } from "./errors";

export async function withErrorHandling(handler: () => Promise<Response | undefined>): Promise<Response> {
  try {
    const result = await handler();

    return result ?? new Response(null, { status: 204 });
  } catch (error) {
    captureException(error);

    if (error instanceof ApiError) {
      const response: Record<string, unknown> = {
        code: error.code,
        error: error.message,
      };

      if (error instanceof ValidationError && error.errors) {
        response.errors = error.errors;
      }

      return Response.json(response, { status: error.statusCode });
    }

    const internalServerError = new InternalServerError();
    return Response.json(
      { code: internalServerError.code, error: internalServerError.message },
      { status: internalServerError.statusCode },
    );
  }
}

import { captureException } from "@sentry/nextjs";

import { envName } from "../config/env";
import { ApiError, BadRequestError, InternalServerError, ValidationError } from "./errors";

export async function withErrorHandling(handler: () => Promise<Response | undefined>): Promise<Response> {
  try {
    const result = await handler();

    return result ?? new Response(null, { status: 204 });
  } catch (error) {
    if (envName !== "production") {
      console.error("API Error:", error);
    }

    if (error instanceof ApiError) {
      captureException(error, {
        extra: {
          ...(error instanceof ValidationError && error.errors ? { validationErrors: error.errors } : {}),
        },
        level: error.statusCode >= 500 ? "error" : "warning",
        tags: {
          error_code: error.code,
          error_type: error.constructor.name,
          status_code: error.statusCode.toString(),
        },
      });
    } else {
      captureException(error, {
        level: "error",
        tags: {
          error_type: "unexpected",
        },
      });
    }

    if (error instanceof ApiError) {
      const response: Record<string, unknown> = {
        code: error.code,
        error: error.message,
      };

      if (error instanceof ValidationError && error.errors) {
        response.errors = error.errors;
      }

      if (error instanceof BadRequestError && error.data) {
        response.data = error.data;
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

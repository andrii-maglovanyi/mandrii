import { ZodSchema } from "zod";

export async function validateRequest<T>(
  req: Request,
  schema: ZodSchema<T>,
): Promise<{ data: T } | { error: Response }> {
  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return {
      error: Response.json(
        { details: result.error.issues, error: "Invalid input" },
        { status: 400 },
      ),
    };
  }

  return { data: result.data };
}

import { z, ZodObject, ZodRawShape, ZodType } from "zod";

import { isZodArray } from "../utils";
import { ValidationError } from "./errors";

export async function validateRequest<T extends ZodRawShape>(
  req: Request,
  schema: ZodObject<T>,
): Promise<z.infer<typeof schema>> {
  const contentType = req.headers.get("content-type");
  let body: unknown;

  if (contentType?.includes("multipart/form-data")) {
    const formData = await req.formData();
    body = Object.fromEntries(
      Array.from(formData.entries()).map(([field, value]) => {
        const schemaField = schema.shape[field as keyof T] as unknown as ZodType;
        const allValues = formData.getAll(field);

        if (isZodArray(schemaField)) {
          return [field, allValues];
        }
        return [field, allValues.length > 1 ? allValues[0] : value];
      }),
    );
  } else if (contentType?.includes("application/x-www-form-urlencoded")) {
    const formData = await req.formData();
    body = Object.fromEntries(formData);
  } else {
    body = await req.json();
  }
  console.log(">>BODY", body);

  const result = schema.safeParse(body);

  console.log("RESULT", result);

  if (!result.success) {
    throw new ValidationError("Invalid input", result.error.issues);
  }

  return result.data;
}

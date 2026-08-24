import { z, ZodObject, ZodRawShape, ZodType } from "zod";

import { isZodArray } from "../utils";
import { BadRequestError, ValidationError } from "./errors";

export async function validateRequest<T extends ZodType>(req: Request, schema: T): Promise<z.infer<T>> {
  const contentType = req.headers.get("content-type");
  let body: unknown;

  if (contentType?.includes("multipart/form-data")) {
    if (!(schema instanceof ZodObject)) {
      throw new BadRequestError("Multipart requests require an object schema");
    }

    const objectSchema = schema as ZodObject<ZodRawShape>;
    const formData = await req.formData();
    body = Object.fromEntries(
      Array.from(formData.entries()).map(([field, value]) => {
        const schemaField = objectSchema.shape[field] as unknown as ZodType;
        const allValues = formData.getAll(field);

        if (isZodArray(schemaField)) {
          return [field, allValues];
        }

        let processedValue: unknown = value;
        if (typeof value === "string") {
          try {
            processedValue = JSON.parse(value);
          } catch {
            // Not JSON, keep original string
          }
        }
        return [field, allValues.length > 1 ? allValues[0] : processedValue];
      }),
    );
  } else if (contentType?.includes("application/x-www-form-urlencoded")) {
    const formData = await req.formData();
    body = Object.fromEntries(formData);
  } else {
    body = await req.json();
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    throw new ValidationError("Invalid input", result.error.issues);
  }

  return result.data;
}

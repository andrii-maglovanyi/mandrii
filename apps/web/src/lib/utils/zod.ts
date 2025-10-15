import { ZodArray, ZodDefault, ZodNullable, ZodOptional, ZodType } from "zod";

export function isZodArray(schemaField: ZodType): schemaField is ZodArray<ZodType> {
  return unwrapType(schemaField) instanceof ZodArray;
}
export function unwrapType(schema: ZodType): ZodType {
  if (schema instanceof ZodOptional || schema instanceof ZodNullable || schema instanceof ZodDefault) {
    return unwrapType(schema.unwrap() as ZodType);
  }

  return schema;
}

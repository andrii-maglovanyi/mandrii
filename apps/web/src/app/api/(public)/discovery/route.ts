import { z } from "zod";

import { BadRequestError, rateLimiters, withErrorHandling } from "~/lib/api";
import { PUBLIC_OPERATIONS } from "~/lib/public-cache/operations";
import { getCachedPublicQuery } from "~/lib/public-cache/query";

const inputSchema = z.object({
  operationName: z.enum(PUBLIC_OPERATIONS),
  variables: z
    .object({
      includeCount: z.boolean().optional(),
      includeTotal: z.boolean().optional(),
      // Preserve GraphQL pagination semantics, including large accumulated mobile lists.
      limit: z.number().int().min(1).max(2_147_483_647).nullable().optional(),
      offset: z.number().int().min(0).max(2_147_483_647).nullable().optional(),
      order_by: z
        .union([z.record(z.string(), z.unknown()), z.array(z.record(z.string(), z.unknown())).max(10)])
        .nullable()
        .optional(),
      totalWhere: z.record(z.string(), z.unknown()).nullable().optional(),
      where: z.record(z.string(), z.unknown()).optional(),
      whereEvents: z.record(z.string(), z.unknown()).nullable().optional(),
    })
    .default({}),
});
const MAX_BODY_BYTES = 1_000_000;
const operators = new Set([
  "_and",
  "_eq",
  "_gt",
  "_gte",
  "_ilike",
  "_in",
  "_is_null",
  "_like",
  "_lt",
  "_lte",
  "_neq",
  "_nin",
  "_not",
  "_or",
  "_st_d_within",
]);

async function readInput(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new BadRequestError("Query body is required");
  const decoder = new TextDecoder();
  let bytes = 0;
  let body = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new BadRequestError("Query is too large");
      }
      body += decoder.decode(chunk.value, { stream: true });
    }
    body += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  let decoded: unknown;
  try {
    decoded = JSON.parse(body);
  } catch {
    throw new BadRequestError("Invalid JSON query");
  }
  const parsed = inputSchema.safeParse(decoded);
  if (!parsed.success) throw new BadRequestError("Invalid discovery query");
  validateFilterComplexity(parsed.data.variables);
  return parsed.data;
}

function validateFilterComplexity(value: unknown, depth = 0) {
  if (depth > 16) throw new BadRequestError("Filter is too deeply nested");
  if (typeof value === "string" && value.length > 4096) throw new BadRequestError("Filter value is too long");
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (!Array.isArray(value) && key.startsWith("_") && !operators.has(key))
      throw new BadRequestError("Unsupported filter operator");
    validateFilterComplexity(child, depth + 1);
  }
}

export const POST = (request: Request) =>
  withErrorHandling(async () => {
    await rateLimiters.discovery.check();
    const { operationName, variables } = await readInput(request);
    // Ignore submitted GraphQL text. Only fixed public read documents execute.
    const result = await getCachedPublicQuery(operationName, variables);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  });

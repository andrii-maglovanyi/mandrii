export const safeFloat = (value: unknown, fallback = 0, min?: number): number => {
  const n = typeof value === "string" ? Number.parseFloat(value) : Number(value);
  const result = Number.isFinite(n) ? n : fallback;
  return min !== undefined ? Math.max(min, result) : result;
};

export const safeInt = (value: unknown, fallback = 0, min?: number): number => {
  const n = typeof value === "string" ? Number.parseInt(value as string, 10) : Math.trunc(Number(value));
  const result = Number.isFinite(n) ? n : fallback;
  return min !== undefined ? Math.max(min, result) : result;
};

import { describe, it, expect } from "vitest";
import { safeFloat, safeInt } from "./parse";

// ── safeFloat ─────────────────────────────────────────────────────────────────

describe("safeFloat", () => {
  it("parses a numeric string", () => {
    expect(safeFloat("3.14")).toBe(3.14);
  });

  it("parses a negative numeric string", () => {
    expect(safeFloat("-2.5")).toBe(-2.5);
  });

  it("passes through a number", () => {
    expect(safeFloat(42.5)).toBe(42.5);
  });

  it("returns fallback for non-numeric string", () => {
    expect(safeFloat("abc")).toBe(0);
    expect(safeFloat("abc", 99)).toBe(99);
  });

  it("returns fallback for empty string", () => {
    expect(safeFloat("")).toBe(0);
  });

  it("returns fallback for undefined", () => {
    expect(safeFloat(undefined, 5)).toBe(5);
  });

  it("returns fallback for null", () => {
    expect(safeFloat(null, 7)).toBe(7);
  });

  it("returns fallback for NaN", () => {
    expect(safeFloat(NaN, 3)).toBe(3);
  });

  it("returns fallback for Infinity", () => {
    expect(safeFloat(Infinity, 1)).toBe(1);
    expect(safeFloat(-Infinity, 1)).toBe(1);
  });

  it("enforces min when result is below it", () => {
    expect(safeFloat("-5", 0, 0)).toBe(0);
    expect(safeFloat("1.5", 0, 2)).toBe(2);
  });

  it("does not clamp when result is above min", () => {
    expect(safeFloat("10.5", 0, 5)).toBe(10.5);
  });

  it("min does not affect fallback replacement for invalid input", () => {
    // fallback=0 is already >= min=0
    expect(safeFloat("abc", 0, 0)).toBe(0);
  });
});

// ── safeInt ───────────────────────────────────────────────────────────────────

describe("safeInt", () => {
  it("parses an integer string", () => {
    expect(safeInt("25")).toBe(25);
  });

  it("truncates a decimal string (parseInt stops at decimal point)", () => {
    expect(safeInt("3.9")).toBe(3);
  });

  it("passes through an integer number", () => {
    expect(safeInt(10)).toBe(10);
  });

  it("truncates a float number", () => {
    expect(safeInt(7.8)).toBe(7);
  });

  it("returns fallback for non-numeric string", () => {
    expect(safeInt("abc")).toBe(0);
    expect(safeInt("abc", 5)).toBe(5);
  });

  it("returns fallback for undefined", () => {
    expect(safeInt(undefined, 3)).toBe(3);
  });

  it("returns fallback for null", () => {
    expect(safeInt(null, 2)).toBe(2);
  });

  it("returns fallback for NaN", () => {
    expect(safeInt(NaN, 4)).toBe(4);
  });

  it("returns fallback for Infinity", () => {
    expect(safeInt(Infinity, 1)).toBe(1);
  });

  it("enforces min when result is below it", () => {
    expect(safeInt("-3", 0, 0)).toBe(0);
    expect(safeInt("1", 0, 5)).toBe(5);
  });

  it("does not clamp when result is above min", () => {
    expect(safeInt("20", 0, 5)).toBe(20);
  });
});

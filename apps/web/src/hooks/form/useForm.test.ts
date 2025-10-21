import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { useForm } from "./useForm"; // adjust path to your hook file

const schema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(1, "Name required"),
});

describe("useForm", () => {
  it("initializes with empty or provided values", () => {
    const { result } = renderHook(() => useForm({ initialValues: { name: "John" }, schema }));
    expect(result.current.values.name).toBe("John");
    expect(result.current.values.email).toBe("");
  });

  it("updates values via onChange", () => {
    const { result } = renderHook(() => useForm({ schema }));

    act(() => {
      result.current.handleChange("name")("Jane");
    });

    expect(result.current.values.name).toBe("Jane");
  });

  it("validates field on blur and sets error", () => {
    const { result } = renderHook(() => useForm({ schema }));

    act(() => {
      result.current.handleBlur("name")();
    });

    expect(result.current.errors.name).toBe("Name required");
    expect(result.current.touched.name).toBe(true);
  });

  it("validates entire form and returns false if invalid", () => {
    const { result } = renderHook(() => useForm({ schema }));

    let validationResult: false | { email: string; name: string } = false;

    act(() => {
      validationResult = result.current.validateForm();
    });

    expect(validationResult).toBe(false);
    expect(result.current.errors.name).toBe("Name required");
    expect(result.current.errors.email).toBe("Invalid email");
  });

  it("returns validated values if form is valid", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: "alice@example.com", name: "Alice" },
        schema,
      }),
    );

    let validationResult;
    act(() => {
      validationResult = result.current.validateForm();
    });

    expect(validationResult).not.toBe(false);
    expect(validationResult).toEqual({ email: "alice@example.com", name: "Alice" });
    expect(result.current.errors.name).toBeUndefined();
    expect(result.current.errors.email).toBeUndefined();
  });

  it("allows manually setting server-side errors", () => {
    const { result } = renderHook(() => useForm({ schema }));

    act(() => {
      result.current.setFieldErrorsFromServer([{ code: "custom", message: "Email already taken", path: ["email"] }]);
    });

    expect(result.current.errors.email).toBe("Email already taken");
  });

  it("computes isFormValid correctly", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: "alice@example.com", name: "Alice" },
        schema,
      }),
    );

    expect(result.current.isFormValid).toBe(true);

    act(() => {
      result.current.handleChange("email")("invalid");
    });

    expect(result.current.isFormValid).toBe(false);
  });

  describe("integration with useFormSubmit", () => {
    it("useForm does not include submission methods", () => {
      const { result } = renderHook(() => useForm({ schema }));
      expect(result.current).not.toHaveProperty("status");
      expect(result.current).not.toHaveProperty("handleSubmit");
    });

    it("provides validateForm and setFieldErrorsFromServer for useFormSubmit", () => {
      const { result } = renderHook(() => useForm({ schema }));
      expect(typeof result.current.validateForm).toBe("function");
      expect(typeof result.current.setFieldErrorsFromServer).toBe("function");
    });
  });
});

// NOTE: Tests for useFormSubmit should be created in a separate test file:
// src/hooks/form/useFormSubmit.test.ts

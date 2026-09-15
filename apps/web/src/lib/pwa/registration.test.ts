import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it("shares worker registration across startup and notification enrollment and retries failures", async () => {
  vi.resetModules();
  const registration = { scope: "/" };
  const register = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(registration);
  vi.stubGlobal("navigator", { serviceWorker: { register } });
  const { registerAppWorker } = await import("./registration");
  await expect(registerAppWorker()).rejects.toThrow("offline");
  expect(await Promise.all([registerAppWorker(), registerAppWorker()])).toEqual([registration, registration]);
  expect(register).toHaveBeenCalledTimes(2);
});
it("bounds the wait for a worker that never activates", async () => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.stubGlobal("navigator", {
    serviceWorker: { ready: new Promise(() => {}), register: vi.fn().mockResolvedValue({}) },
  });
  const { readyAppWorker } = await import("./registration");
  const result = expect(readyAppWorker()).rejects.toThrow("Unable to prepare notifications");
  await vi.advanceTimersByTimeAsync(15_000);
  await result;
});

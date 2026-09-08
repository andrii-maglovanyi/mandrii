import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContentAlertDeliverySettings } from "./ContentAlertDeliverySettings";

vi.mock("~/hooks/useNotifications", () => ({
  useNotifications: () => ({ showError: vi.fn(), showSuccess: vi.fn() }),
}));

vi.mock("~/i18n/useI18n", () => ({
  useI18n: () => (key: string) => key,
}));

const preferences = {
  emailEnabled: false,
  frequency: "IMMEDIATE" as const,
  pushEnabled: false,
  pushSubscribed: true,
  pushSupported: true,
  telegramEnabled: false,
  telegramLinked: true,
};

const jsonResponse = (body: unknown) => ({
  json: async () => body,
  ok: true,
});

describe("Settings delivery controls", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.location.hash = "";
  });

  it("keeps unrelated controls usable while one preference is saving", async () => {
    let resolveSave: ((response: ReturnType<typeof jsonResponse>) => void) | undefined;
    const pendingSave = new Promise<ReturnType<typeof jsonResponse>>((resolve) => {
      resolveSave = resolve;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn((_input: string | URL | Request, init?: RequestInit) =>
        init?.method === "PUT" ? pendingSave : Promise.resolve(jsonResponse(preferences)),
      ),
    );

    render(<ContentAlertDeliverySettings initialPreferences={preferences} />);

    await userEvent.click(screen.getByRole("button", { name: "Manage delivery" }));
    const emailSwitch = await screen.findByRole("switch", { name: "Email" });
    await userEvent.click(emailSwitch);

    expect(emailSwitch).toBeDisabled();
    expect(screen.getByRole("switch", { name: "Browser alerts" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Following alert frequency" })).not.toBeDisabled();

    resolveSave?.(jsonResponse({ ...preferences, emailEnabled: true }));
    await waitFor(() => expect(emailSwitch).not.toBeDisabled());
  });

  it("opens delivery controls when navigated to its anchor", () => {
    window.location.hash = "#content-alert-delivery";

    render(<ContentAlertDeliverySettings id="content-alert-delivery" initialPreferences={preferences} />);

    expect(screen.getByRole("button", { name: "Manage delivery" })).toHaveAttribute("aria-expanded", "true");
  });
});

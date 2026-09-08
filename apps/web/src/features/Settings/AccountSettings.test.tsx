import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccountSettings } from "./AccountSettings";

vi.mock("~/components/ui", async (importOriginal) => {
  const ui = await importOriginal<typeof import("~/components/ui")>();
  return {
    ...ui,
    TextLink: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
  };
});

vi.mock("~/hooks/useNotifications", () => ({
  useNotifications: () => ({ showError: vi.fn(), showSuccess: vi.fn() }),
}));

vi.mock("~/i18n/useI18n", () => ({
  useI18n: () => (key: string) => key,
}));

vi.mock("~/contexts/DialogContext", () => ({
  useDialog: () => ({ openConfirmDialog: vi.fn() }),
}));

vi.mock("./ContentAlertDeliverySettings", () => ({
  ContentAlertDeliverySettings: ({ id }: { id?: string }) => (
    <section id={id}>
      Delivery preferences
    </section>
  ),
}));

const deliveryPreferences = {
  emailEnabled: true,
  frequency: "IMMEDIATE" as const,
  pushEnabled: false,
  pushSubscribed: false,
  pushSupported: true,
  telegramEnabled: false,
  telegramLinked: false,
};

describe("AccountSettings", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders feed notification preferences from the server without a client load", () => {
    render(
      <AccountSettings
        initialContentAlertDeliveryPreferences={deliveryPreferences}
        initialTelegramCommunityPreferences={{ enabled: false, linked: false }}
        initialUpdateNotificationPreferences={{ comments_enabled: true, replies_enabled: false }}
      />,
    );

    expect(screen.getByRole("checkbox", { name: "Comments to posts" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Replies to comments" })).not.toBeChecked();
    expect(screen.getByText("Delivery preferences").closest("section")).toHaveAttribute(
      "id",
      "content-alert-delivery",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("keeps a successful preference change when another concurrent save fails", async () => {
    let rejectFirstSave: (response: Response) => void;
    const firstSave = new Promise<Response>((resolve) => {
      rejectFirstSave = resolve;
    });
    vi.mocked(fetch)
      .mockImplementationOnce(() => firstSave)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ comments_enabled: false, replies_enabled: true }), { status: 200 }),
      );

    render(
      <AccountSettings
        initialContentAlertDeliveryPreferences={deliveryPreferences}
        initialTelegramCommunityPreferences={{ enabled: false, linked: false }}
        initialUpdateNotificationPreferences={{ comments_enabled: true, replies_enabled: false }}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Comments to posts" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Replies to comments" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByRole("checkbox", { name: "Replies to comments" })).toBeChecked());

    rejectFirstSave!(new Response(JSON.stringify({ error: "Unable to save notification preferences" }), { status: 500 }));

    await waitFor(() => expect(screen.getByRole("checkbox", { name: "Comments to posts" })).toBeChecked());
    expect(screen.getByRole("checkbox", { name: "Replies to comments" })).toBeChecked();
  });

  it("updates the Telegram connection state when a follow-alert save reports an unlink", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ...deliveryPreferences,
          telegramEnabled: false,
          telegramLinked: false,
        }),
        { status: 200 },
      ),
    );

    render(
      <AccountSettings
        initialContentAlertDeliveryPreferences={{ ...deliveryPreferences, telegramLinked: true }}
        initialTelegramCommunityPreferences={{ enabled: true, linked: true }}
        initialUpdateNotificationPreferences={{ comments_enabled: true, replies_enabled: false }}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Alerts from followed places" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Link Telegram" })).toBeVisible());
    expect(screen.getByRole("checkbox", { name: "Alerts from followed places" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Private Community responses" })).toBeDisabled();
  });

  it("prevents unlinking while a Telegram preference is saving", async () => {
    const pendingSave = new Promise<Response>(() => undefined);
    vi.mocked(fetch).mockReturnValueOnce(pendingSave);

    render(
      <AccountSettings
        initialContentAlertDeliveryPreferences={{ ...deliveryPreferences, telegramLinked: true }}
        initialTelegramCommunityPreferences={{ enabled: false, linked: true }}
        initialUpdateNotificationPreferences={{ comments_enabled: true, replies_enabled: false }}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Alerts from followed places" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Unlink" })).toBeDisabled());
  });

  it("refreshes Telegram link status without using a cached response", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ url: "https://t.me/example?start=token" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ enabled: false, linked: false }), { status: 200 }));

    render(
      <AccountSettings
        initialContentAlertDeliveryPreferences={deliveryPreferences}
        initialTelegramCommunityPreferences={{ enabled: false, linked: false }}
        initialUpdateNotificationPreferences={{ comments_enabled: true, replies_enabled: false }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Link Telegram" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(fetch).toHaveBeenNthCalledWith(2, "/api/telegram/user-community-notifications", { cache: "no-store" });
    expect(open).toHaveBeenCalledWith("https://t.me/example?start=token", "_blank", "noopener,noreferrer");
  });
});

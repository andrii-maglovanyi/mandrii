import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";

import { AdminChainManager } from "./AdminChainManager";

const { showError, showSuccess } = vi.hoisted(() => ({ showError: vi.fn(), showSuccess: vi.fn() }));
vi.mock("~/hooks/useNotifications", () => ({ useNotifications: () => ({ showError, showSuccess }) }));
vi.mock("~/i18n/useI18n", () => ({ useI18n: () => translate }));
const translate = (key: string) => key;
vi.mock("~/i18n/navigation", () => ({ Link: "a" }));
vi.mock("~/components/ui", () => ({
  ActionButton: ({ icon, ...props }: { icon: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{icon}</button>,
  Button: ({ busy, children, ...props }: { busy?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button disabled={busy} type="button" {...props}>
      {children}
    </button>
  ),
  Checkbox: (props: InputHTMLAttributes<HTMLInputElement>) => <input type="checkbox" {...props} />,
  Input: ({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) => (
    <label>
      {label}
      <input {...props} />
    </label>
  ),
  SectionCard: ({ children, title }: { children: ReactNode; title: ReactNode }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
  Select: () => null,
}));

afterEach(() => vi.unstubAllGlobals());

it("creates a chain without sending a null UUID and prevents edits during saving", async () => {
  const user = userEvent.setup();
  const chain = { chain_id: null, id: "550e8400-e29b-41d4-a716-446655440000", name: "New brand", slug: "new-brand" };
  let finishSave!: (response: Response) => void;
  const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => {
    if (options?.method === "POST")
      return new Promise<Response>((resolve) => {
        finishSave = resolve;
      });
    return Response.json({ chain, chains: [], venues: [] });
  });
  vi.stubGlobal("fetch", fetchMock);
  render(<AdminChainManager />);
  await user.type(screen.getByLabelText("Chain name"), "New brand");
  await user.click(screen.getByRole("button", { name: "Create chain" }));
  await waitFor(() => expect(finishSave).toBeDefined());
  const saveCall = fetchMock.mock.calls.find(([, options]) => options?.method === "POST");
  const payload = JSON.parse(saveCall![1]!.body as string);
  expect(payload).not.toHaveProperty("id");
  expect(payload.name).toBe("New brand");
  expect(screen.getByLabelText("Chain name")).toBeDisabled();
  expect(screen.getByRole("button", { name: "New chain" })).toBeDisabled();
  // Even a programmatic duplicate submit must not create a second chain.
  fireEvent.submit(screen.getByRole("form", { name: "Venue chains" }));
  expect(fetchMock.mock.calls.filter(([, options]) => options?.method === "POST")).toHaveLength(1);
  finishSave(Response.json({ chain }));
  await waitFor(() => expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled());
});

it("reuses an in-flight venue request when a branch is collapsed and expanded again", async () => {
  const user = userEvent.setup();
  const chain = { chain_id: null, display_category: null, id: "chain", name: "Brand", slug: "brand", venue_count: 1 };
  let finishLoad!: (response: Response) => void;
  const fetchMock = vi.fn(async (url: string) => {
    if (url === "/api/admin/chains/chain")
      return new Promise<Response>((resolve) => {
        finishLoad = resolve;
      });
    return Response.json({ chains: [chain] });
  });
  vi.stubGlobal("fetch", fetchMock);
  render(<AdminChainManager />);
  await user.click(await screen.findByRole("button", { name: "Expand {chain}" }));
  await user.click(screen.getByRole("button", { name: "Collapse {chain}" }));
  await user.click(screen.getByRole("button", { name: "Expand {chain}" }));
  expect(fetchMock.mock.calls.filter(([url]) => url === "/api/admin/chains/chain")).toHaveLength(1);
  await act(async () => finishLoad(Response.json({ venues: [] })));
  await waitFor(() => expect(screen.queryByText("Loading venues…")).not.toBeInTheDocument());
});

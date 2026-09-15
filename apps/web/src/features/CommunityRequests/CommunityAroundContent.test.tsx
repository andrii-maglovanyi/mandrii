import type { ReactNode } from "react";

import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { CommunityAroundContent } from "./CommunityAroundContent";

vi.mock("~/i18n/useI18n", () => ({ useI18n: () => (key: string) => key }));
vi.mock("~/components/ui", () => ({
  Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  TextLink: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));
afterEach(() => vi.unstubAllGlobals());
const post = (title: string) => ({ body: "Details", id: title, kind: "REQUEST", location: "London", title });

it("immediately hides the previous venue's posts on navigation", async () => {
  const fetch = vi.fn().mockResolvedValueOnce(Response.json([post("First venue post")])).mockReturnValue(new Promise(() => {}));
  vi.stubGlobal("fetch", fetch);
  const { rerender } = render(<CommunityAroundContent targetId="first" targetType="venue" />);
  expect(await screen.findByText("First venue post")).toBeInTheDocument();
  rerender(<CommunityAroundContent targetId="second" targetType="venue" />);
  expect(screen.queryByText("First venue post")).not.toBeInTheDocument();
});

it("ignores a stale response arriving after a different event has loaded", async () => {
  let finishFirst!: (response: Response) => void;
  const fetch = vi.fn()
    .mockImplementationOnce(() => new Promise<Response>((resolve) => { finishFirst = resolve; }))
    .mockResolvedValueOnce(Response.json([post("Current event post")]));
  vi.stubGlobal("fetch", fetch);
  const { rerender } = render(<CommunityAroundContent targetId="first" targetType="event" />);
  rerender(<CommunityAroundContent targetId="second" targetType="event" />);
  expect(await screen.findByText("Current event post")).toBeInTheDocument();
  await act(async () => finishFirst(Response.json([post("Stale event post")])));
  expect(screen.getByText("Current event post")).toBeInTheDocument();
  expect(screen.queryByText("Stale event post")).not.toBeInTheDocument();
});

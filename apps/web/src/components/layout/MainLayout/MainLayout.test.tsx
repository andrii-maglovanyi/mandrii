import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import { MainLayout } from "./MainLayout";

const viewport = vi.hoisted(() => ({ mobile: false }));
vi.mock("react-responsive", () => ({ useMediaQuery: () => viewport.mobile }));
vi.mock("next/navigation", () => ({ usePathname: () => "/en/guides" }));
vi.mock("~/i18n/useI18n", () => ({ useI18n: () => (key: string) => key }));
vi.mock("~/i18n/navigation", () => ({ Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span> }));
vi.mock("./Desktop/DesktopLayout", () => ({ DesktopLayout: () => <header>Desktop</header> }));
vi.mock("./Mobile/MobileLayout", () => ({ MobileLayout: () => <header>Mobile</header> }));
vi.mock("../CookieConsentBanner/CookieConsentBanner", () => ({ default: () => null }));
vi.mock("../Footer/Footer", () => ({ Footer: () => null }));
vi.mock("../MessageToast/MessageToast", () => ({ MessageToast: () => null }));
vi.mock("../Pwa/PwaControls", () => ({ PwaControls: () => null }));
function Editor() {
  const [text, setText] = useState("");
  return <input aria-label="Draft" value={text} onChange={(event) => setText(event.target.value)} />;
}
it("preserves an unsaved draft when switching between mobile and desktop layouts", () => {
  const { rerender } = render(<MainLayout><Editor /></MainLayout>);
  fireEvent.change(screen.getByRole("textbox", { name: "Draft" }), { target: { value: "Unsaved work" } });
  viewport.mobile = true;
  rerender(<MainLayout><Editor /></MainLayout>);
  expect(screen.getByText("Mobile")).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Draft" })).toHaveValue("Unsaved work");
});

"use client";

import {
  GitBranch,
  House,
  MessageSquareWarning,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { ActionButton } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";

const navigation = [
  { href: "/admin", icon: MessageSquareWarning, label: "Review moderation" },
  { href: "/admin/chains", icon: GitBranch, label: "Venue chains" },
  { href: "/admin/qr", icon: QrCode, label: "QR codes" },
];

export function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const i18n = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [isNavigationCollapsed, setIsNavigationCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className={`
        sticky top-0 z-40 border-b border-on-surface/10 bg-surface/95
        backdrop-blur
      `}>
        <div className={`
          mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between
          gap-3 px-4
          sm:px-6
        `}>
          <div className="flex items-center gap-4">
            <Link className={`
              flex min-h-11 items-center gap-3 rounded-md font-semibold
            `} href="/admin">
              <span className={`
                flex size-9 items-center justify-center rounded-lg bg-primary/10
                text-primary
              `}>
                <ShieldCheck aria-hidden size={20} />
              </span>
              <span>{i18n("Admin")}</span>
            </Link>
            <span aria-hidden className="h-6 w-px bg-on-surface/15" />
            <p className="text-sm leading-none text-neutral">{i18n("Platform operations")}</p>
          </div>
          <ActionButton
            aria-label={i18n("Back to website")}
            icon={<House aria-hidden size={19} />}
            onClick={() => router.push("/")}
            tooltipPosition="bottom-end"
            variant="ghost"
          />
        </div>
      </header>

      <div className={`
        mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6
        sm:px-6
        lg:flex-row lg:py-8
      `}>
        <nav
          aria-label={i18n("Admin navigation")}
          className={`
            transition-[width] duration-200
            lg:shrink-0
            ${isNavigationCollapsed ? `lg:w-16` : `lg:w-56`}
          `}
        >
          <div
            className={`
              flex gap-6 overflow-x-auto pb-3
              lg:flex-col lg:items-start lg:gap-1 lg:overflow-visible lg:pb-0
              lg:pl-2
              ${
              isNavigationCollapsed ? "lg:pr-2" : "lg:pr-6"
            }
            `}
          >
            <div className={`
              mb-3 hidden w-full
              lg:flex
              ${isNavigationCollapsed ? `justify-start` : `justify-end`}
            `}>
              <ActionButton
                aria-label={isNavigationCollapsed ? i18n("Expand admin navigation") : i18n("Collapse admin navigation")}
                className={`
                  rounded-full bg-surface-tint/70 text-neutral/80
                  hover:bg-surface-tint
                `}
                icon={
                  isNavigationCollapsed ? (
                    <PanelLeftOpen aria-hidden size={18} />
                  ) : (
                    <PanelLeftClose aria-hidden size={18} />
                  )
                }
                onClick={() => setIsNavigationCollapsed((collapsed) => !collapsed)}
                tooltipPosition={isNavigationCollapsed ? "right" : "left"}
                variant="ghost"
              />
            </div>
            {navigation.map(({ href, icon: Icon, label }) => {
              const active = pathname === href;
              const link = (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`
                    flex min-h-11 shrink-0 items-center gap-0 rounded-lg px-2
                    text-base font-medium transition-colors
                    ${
                    isNavigationCollapsed ? "lg:w-11 lg:justify-center lg:px-0" : ""
                  }
                    ${active ? "!font-semibold text-primary" : `
                      text-neutral
                      hover:text-primary
                    `}
                  `}
                  href={href}
                  key={href}
                >
                  <span className="flex w-10 shrink-0 justify-center">
                    <Icon aria-hidden size={18} />
                  </span>
                  <span className={isNavigationCollapsed ? "lg:sr-only" : `
                    lg:whitespace-nowrap
                  `}>{i18n(label)}</span>
                </Link>
              );

              return link;
            })}
          </div>
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

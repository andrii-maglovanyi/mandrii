"use client";

import { House, MessageSquareWarning, QrCode, ShieldCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { ActionButton } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";

const navigation = [
  { href: "/admin", icon: MessageSquareWarning, label: "Review moderation" },
  { href: "/admin/qr", icon: QrCode, label: "QR codes" },
];

export function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const i18n = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <header className="border-on-surface/10 bg-surface/95 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex gap-3 px-4 sm:px-6">
            <a className="flex min-h-11 items-center gap-2 rounded-md font-semibold" href="/admin">
              <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                <ShieldCheck aria-hidden size={20} />
              </span>
              <span>{i18n("Admin")}</span>
            </a>
            <span aria-hidden className="bg-on-surface/15 h-5 w-px" />
            <p className="text-neutral text-sm">{i18n("Platform operations")}</p>
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

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:py-8">
        <nav aria-label={i18n("Admin navigation")} className="lg:w-52 lg:shrink-0">
          <div className="border-on-surface/10 flex gap-6 overflow-x-auto border-b pb-3 lg:flex-col lg:items-start lg:gap-3 lg:border-r lg:border-b-0 lg:pr-6 lg:pb-0">
            {navigation.map(({ href, icon: Icon, label }) => {
              const active = pathname === href;
              return (
                <a
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 shrink-0 items-center gap-2 text-base font-medium transition-colors ${
                    active ? "text-primary !font-semibold" : "text-neutral hover:text-primary"
                  }`}
                  href={href}
                  key={href}
                >
                  <Icon aria-hidden size={18} />
                  {i18n(label)}
                </a>
              );
            })}
          </div>
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { AnimatedEllipsis } from "~/components/ui";
import { useAuth } from "~/contexts/AuthContext";
import { useRouter } from "~/i18n/navigation";
import { isInactiveAccount } from "~/lib/auth/account-status";

export const AccountStatusGate = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const { isLoading, profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isInactive = isInactiveAccount(profile?.status);
  const isInactiveAccountPage = pathname.endsWith("/account-inactive");

  useEffect(() => {
    if (!isLoading && isInactive && !isInactiveAccountPage) {
      router.replace("/account-inactive");
    }
  }, [isInactive, isInactiveAccountPage, isLoading, router]);

  if (isInactive && !isInactiveAccountPage) {
    return (
      <div className="text-neutral container mx-auto flex min-h-80 items-center justify-center" role="status">
        <AnimatedEllipsis el="." />
      </div>
    );
  }

  return <>{children}</>;
};

"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";

export const InactiveAccountActions = () => {
  const i18n = useI18n();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Button color="neutral" onClick={handleSignOut} variant="outlined">
      <LogOut aria-hidden="true" className="mr-2" size={18} />
      {i18n("Sign out")}
    </Button>
  );
};

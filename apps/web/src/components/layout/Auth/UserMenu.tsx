import { LogOut, StretchHorizontal, User } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";

interface UserMenuProps {
  onNavigate?: () => void;
}

export const UserMenu = ({ onNavigate = () => {} }: UserMenuProps) => {
  const i18n = useI18n();

  const handleSignOut = async () => {
    const result = await signOut({
      callbackUrl: `${globalThis.location.origin}/`,
      redirect: false,
    });

    sendToMixpanel("Signed Out", { platform: "desktop" });

    globalThis.location.href = result.url;
  };

  return (
    <>
      <Link href="/user-profile" onClick={onNavigate}>
        <User className="mr-2" /> {i18n("My profile")}
      </Link>
      <Link href="/user-directory" onClick={onNavigate}>
        <StretchHorizontal className="mr-2" /> {i18n("My directory")}
      </Link>
      <Link href="/#" onClick={handleSignOut}>
        <LogOut className="mr-2" /> {i18n("Sign out")}
      </Link>
    </>
  );
};

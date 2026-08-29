import { LogOut, MessageCircle, Settings, ShieldCheck, StretchHorizontal } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";

interface UserMenuProps {
  inactive?: boolean;
  isAdmin?: boolean;
  onNavigate?: () => void;
  unreadMessages?: number;
}

export const UserMenu = ({
  inactive = false,
  isAdmin = false,
  onNavigate = () => {},
  unreadMessages = 0,
}: UserMenuProps) => {
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
      {!inactive && (
        <>
          <Link href="/messages" onClick={onNavigate}>
            <MessageCircle className="mr-2" /> {i18n("Messages")}
            {unreadMessages > 0 && (
              <span aria-hidden="true" className="bg-primary ml-2 inline-block h-2.5 w-2.5 rounded-full" />
            )}
          </Link>
          <Link href="/user-directory" onClick={onNavigate}>
            <StretchHorizontal className="mr-2" /> {i18n("My directory")}
          </Link>
          <Link href="/user-profile/settings" onClick={onNavigate}>
            <Settings className="mr-2" /> {i18n("Settings")}
          </Link>
          {isAdmin && (
            <Link href="/admin" onClick={onNavigate}>
              <ShieldCheck className="mr-2" /> Admin
            </Link>
          )}
        </>
      )}
      <Link href="/#" onClick={handleSignOut}>
        <LogOut className="mr-2" /> {i18n("Sign out")}
      </Link>
    </>
  );
};

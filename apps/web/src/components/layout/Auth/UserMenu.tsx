import { LogOut, StretchHorizontal, User } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";

export const UserMenu = () => {
  const i18n = useI18n();

  const handleSignOut = async () => {
    const result = await signOut({
      callbackUrl: `${window.location.origin}/`,
      redirect: false,
    });

    sendToMixpanel("Signed Out", { platform: "desktop" });

    window.location.href = result.url;
  };

  return (
    <>
      <Link href="/user-profile">
        <User className="mr-2" /> {i18n("My profile")}
      </Link>
      <Link href="/user-directory">
        <StretchHorizontal className="mr-2" /> {i18n("My directory")}
      </Link>
      <Link href="/#" onClick={handleSignOut}>
        <LogOut className="mr-2" /> {i18n("Sign out")}
      </Link>
    </>
  );
};

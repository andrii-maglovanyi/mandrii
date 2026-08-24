import { Loader2, LogIn } from "lucide-react";
import Link from "next/link";

import { Separator } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { useUser } from "~/hooks/useUser";
import { useUnreadMessages } from "~/hooks/useUnreadMessages";
import { useI18n } from "~/i18n/useI18n";
import { isInactiveAccount } from "~/lib/auth/account-status";

import { SignInForm } from "./SignInForm";
import { UserMenu } from "./UserMenu";
import { UserProfileCard } from "./UserProfileCard";

export function MobileAuth({ children }: Readonly<{ children: React.ReactNode }>) {
  const i18n = useI18n();

  const { data: profileData, isAuthenticated, isLoading } = useUser();
  const inactive = isInactiveAccount(profileData?.status);
  const unreadMessages = useUnreadMessages(isAuthenticated && !inactive);
  const { openCustomDialog } = useDialog();

  const handleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();

    openCustomDialog({
      children: <SignInForm />,
    });
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center">
          <Loader2 className="animate-spin" />
          <p className="ml-2">{i18n("Loading your session...")}</p>
        </div>
        {children}
      </>
    );
  }

  if (isAuthenticated) {
    return (
      <>
        <UserProfileCard inactive={inactive} profile={profileData!} />

        {children}
        <Separator className="mb-6" variant="margin" />
        <UserMenu inactive={inactive} unreadMessages={unreadMessages} />
      </>
    );
  }

  return (
    <>
      {children}
      <Separator className="mb-6" variant="margin" />
      <Link href="/#" onClick={handleSignIn}>
        <LogIn className="mr-2" /> {i18n("Sign in")}
      </Link>
    </>
  );
}

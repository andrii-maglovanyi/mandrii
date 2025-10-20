import { Loader2, LogIn } from "lucide-react";
import Link from "next/link";

import { Separator } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { useI18n } from "~/i18n/useI18n";
import { useUser } from "~/hooks/useUser";

import { SignInForm } from "./SignInForm";
import { UserMenu } from "./UserMenu";
import { UserProfileCard } from "./UserProfile";

export function MobileAuth({ children }: Readonly<{ children: React.ReactNode }>) {
  const i18n = useI18n();

  const { data: profileData, isLoading, isAuthenticated } = useUser();
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
        <div className="bg-surface-tint rounded-xl p-4">
          <UserProfileCard profile={profileData!} />
        </div>

        {children}
        <Separator className="mb-6" variant="margin" />
        <UserMenu />
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

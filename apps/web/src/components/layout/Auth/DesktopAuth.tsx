import { LogIn, User } from "lucide-react";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import { ActionButton, Separator } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { useI18n } from "~/i18n/useI18n";

import { SignInForm } from "./SignInForm";
import { UserMenu } from "./UserMenu";
import { UserProfile } from "./UserProfile";

interface ProfileMenuProps {
  profileData: Session;
}

const ProfileMenu = ({ profileData }: ProfileMenuProps) => {
  const i18n = useI18n();
  const [open, setOpen] = useState(false);
  const [render, setRender] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mount/unmount with delay
  useEffect(() => {
    if (open) {
      setRender(true);
    } else {
      const timeout = setTimeout(() => setRender(false), 200); // match transition duration
      return () => clearTimeout(timeout);
    }
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <ActionButton aria-label="Profile" icon={<User />} onClick={() => setOpen(!open)} variant="ghost" />
      {render && (
        <menu
          className={`
            absolute right-0 z-40 mt-2 w-max origin-top-right transform
            space-y-2 rounded-md bg-surface-tint p-4 text-on-surface shadow-lg
            transition duration-200 ease-out
            dark:shadow-neutral-500/10
            ${open ? `scale-100 opacity-100` : `scale-95 opacity-0`}
          `}
        >
          <UserProfile
            email={profileData.user?.email ?? ""}
            imageUrl={profileData.user?.image}
            name={profileData.user?.name ?? i18n("Someone")}
          />
          <Separator className="mb-6" />
          <UserMenu />
        </menu>
      )}
    </div>
  );
};

export function DesktopAuth() {
  const i18n = useI18n();
  const { data: profileData, status } = useSession();
  const { openCustomDialog } = useDialog();

  const isAuthenticated = !!profileData;
  const isLoading = status === "loading";

  const handleSignIn = async () => {
    openCustomDialog({
      children: <SignInForm />,
    });
  };

  if (isAuthenticated) {
    return <ProfileMenu profileData={profileData} />;
  }

  return (
    <ActionButton
      aria-label={isLoading ? i18n("Loading your session...") : i18n("Sign in")}
      busy={isLoading}
      icon={<LogIn />}
      onClick={handleSignIn}
      variant="ghost"
    />
  );
}

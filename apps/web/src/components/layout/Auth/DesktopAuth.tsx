import { LogIn, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ActionButton } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { useUser } from "~/hooks/useUser";
import { useI18n } from "~/i18n/useI18n";
import { isInactiveAccount } from "~/lib/auth/account-status";
import { UserSession } from "~/types/user";
import { useUnreadMessages } from "~/hooks/useUnreadMessages";

import { SignInForm } from "./SignInForm";
import { UserMenu } from "./UserMenu";
import { UserProfileCard } from "./UserProfileCard";

interface ProfileMenuProps {
  profileData: UserSession;
}

const ProfileMenu = ({ profileData }: ProfileMenuProps) => {
  const [open, setOpen] = useState(false);
  const [render, setRender] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inactive = isInactiveAccount(profileData.status);
  const unreadMessages = useUnreadMessages(!inactive);
  const i18n = useI18n();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setRender(true);
    } else {
      const timeout = setTimeout(() => setRender(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <ActionButton
        aria-label={unreadMessages > 0 ? i18n("Profile, unread messages") : i18n("Profile")}
        icon={<User />}
        onClick={() => setOpen(!open)}
        variant="ghost"
      />
      {unreadMessages > 0 && (
        <span
          aria-hidden="true"
          className="bg-primary ring-surface pointer-events-none absolute top-1 right-1 h-2.5 w-2.5 rounded-full ring-2"
        />
      )}
      {render && (
        <menu
          className={`bg-surface-tint text-on-surface absolute right-0 z-40 mt-2 w-max origin-top-right transform space-y-4 rounded-md p-4 shadow-lg transition duration-200 ease-out dark:shadow-neutral-500/10 ${open ? `scale-100 opacity-100` : `scale-95 opacity-0`} `}
        >
          <UserProfileCard inactive={inactive} profile={profileData} />

          <UserMenu
            inactive={inactive}
            isAdmin={profileData.role === "admin"}
            onNavigate={() => setOpen(false)}
            unreadMessages={unreadMessages}
          />
        </menu>
      )}
    </div>
  );
};

export function DesktopAuth() {
  const i18n = useI18n();
  const { data: profileData, isLoading } = useUser();
  const { openCustomDialog } = useDialog();

  const isAuthenticated = !!profileData;

  const handleSignIn = async () => {
    openCustomDialog({
      children: <SignInForm />,
    });
  };

  if (isAuthenticated && !isLoading) {
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

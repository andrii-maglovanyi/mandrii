import { Crown } from "lucide-react";

import { useRouter } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";
import { UserSession } from "~/types/user";

import { Avatar } from "../Avatar/Avatar";
import { RevisionCard } from "./RevisionCard";

interface UserProfileCardProps {
  profile: UserSession;
}

export const UserProfileCard = ({ profile }: UserProfileCardProps) => {
  const i18n = useI18n();
  const router = useRouter();

  const { email = "", name, role } = profile;
  const userName = name ?? i18n("Someone");
  const isAdmin = role === "admin";

  return (
    <div>
      <button className="block w-full text-left" onClick={() => router.push("/user-profile")} type="button">
        <div
          className={`from-primary/7.5 to-secondary/7.5 flex cursor-pointer items-center gap-3 rounded-lg bg-linear-to-r p-3 transition-all duration-200`}
        >
          <div className="relative">
            <div
              className={`from-primary to-secondary absolute inset-0 rounded-full bg-linear-to-r opacity-20 blur-sm`}
            />
            <Avatar avatarSize={48} className="relative" profile={profile} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-on-surface truncate font-semibold">{userName}</span>
              {isAdmin && (
                <div
                  className={`flex items-center gap-1 rounded-md bg-linear-to-r from-amber-500 to-amber-600 px-2 py-0.5 text-xs font-medium text-white`}
                >
                  <Crown size={12} />
                  <span>Admin</span>
                </div>
              )}
            </div>

            <span className="text-neutral truncate text-sm">{email}</span>
          </div>
        </div>
      </button>
      <RevisionCard isAdmin={isAdmin} />
    </div>
  );
};

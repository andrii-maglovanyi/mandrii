import { Crown } from "lucide-react";

import { Badge } from "~/components/ui";
import { useRouter } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";
import { UserSession } from "~/types/user";

import { Avatar } from "../Avatar/Avatar";
import { RevisionCard } from "./RevisionCard";

interface UserProfileCardProps {
  inactive?: boolean;
  profile: UserSession;
}

export const UserProfileCard = ({ inactive = false, profile }: UserProfileCardProps) => {
  const i18n = useI18n();
  const router = useRouter();

  const { email = "", name, role } = profile;
  const userName = name ?? i18n("Someone");
  const isAdmin = role === "admin";
  const destination = inactive ? "/account-inactive" : "/user-profile";

  const card = (
    <div className="from-primary/7.5 to-secondary/7.5 flex items-center gap-3 rounded-lg bg-linear-to-r p-3 transition-[transform,box-shadow] duration-200 ease-out group-hover:shadow-md group-focus-visible:shadow-md motion-safe:group-hover:scale-[1.015] motion-safe:group-focus-visible:scale-[1.015] motion-reduce:transition-none">
      <div className="relative">
        <div className={`from-primary to-secondary absolute inset-0 rounded-full bg-linear-to-r opacity-20 blur-sm`} />
        <Avatar avatarSize={48} className="relative" profile={profile} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-on-surface truncate font-semibold">{userName}</span>
          {inactive ? (
            <Badge variant="warning">{i18n("Inactive")}</Badge>
          ) : isAdmin ? (
            <div
              className={`flex items-center gap-1 rounded-md bg-linear-to-r from-amber-500 to-amber-600 px-2 py-0.5 text-xs font-medium text-white`}
            >
              <Crown size={12} />
              <span>{i18n("Admin")}</span>
            </div>
          ) : null}
        </div>

        <span className="text-neutral truncate text-sm">{email}</span>
      </div>
    </div>
  );

  return (
    <div>
      <button
        className="group focus-visible:outline-primary block w-full cursor-pointer rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={() => router.push(destination)}
        type="button"
      >
        {card}
      </button>
      <RevisionCard isAdmin={isAdmin && !inactive} />
    </div>
  );
};

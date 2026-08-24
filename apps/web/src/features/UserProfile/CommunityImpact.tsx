"use client";

import { CalendarHeart, LayoutDashboard, Star } from "lucide-react";

import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";
import { CommunityAchievements } from "~/features/Gamification/CommunityAchievements";
import { CommunityLevelProgress } from "~/features/Gamification/CommunityLevel";

type CommunityImpactProps = {
  activeDays?: number;
  eventsCreated?: number;
  isVerified?: boolean;
  points?: number;
  showLeaderboardLink?: boolean;
  venuesCreated?: number;
};

export const CommunityImpact = ({
  activeDays = 0,
  eventsCreated = 0,
  isVerified = false,
  points = 0,
  showLeaderboardLink = true,
  venuesCreated = 0,
}: CommunityImpactProps) => {
  const i18n = useI18n();
  const stats = [
    { icon: Star, label: i18n("points"), value: points },
    { icon: LayoutDashboard, label: i18n("venues"), value: venuesCreated },
    { icon: CalendarHeart, label: i18n("events"), value: eventsCreated },
  ];

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2
          className={`from-primary to-secondary bg-linear-to-r bg-clip-text text-xl font-bold text-transparent md:text-2xl`}
        >
          {i18n("Community Impact")}
        </h2>
        {showLeaderboardLink && (
          <Link className="inline-flex min-h-11 items-center gap-2 text-sm" href="/leaderboard">
            <Star aria-hidden size={16} />
            {i18n("Community leaderboard")}
          </Link>
        )}
      </div>
      <div className="mb-4">
        <CommunityLevelProgress points={points} />
        <p className="text-neutral mt-2 text-xs">{i18n("Points are awarded once a venue or event is published.")}</p>
      </div>
      <div className="mb-4">
        <CommunityAchievements
          activeDays={activeDays}
          events={eventsCreated}
          isVerified={isVerified}
          points={points}
          venues={venuesCreated}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            className="group border-primary/20 from-primary/10 to-primary/5 relative overflow-hidden rounded-xl border bg-linear-to-br p-3 sm:p-4"
            key={label}
          >
            <div className="bg-primary/5 absolute -top-4 -right-4 h-24 w-24 rounded-full" />
            <div className="relative">
              <span className="text-neutral block text-xs font-medium sm:text-sm">{label}</span>
              <span className="from-primary to-secondary mt-1 block bg-linear-to-r bg-clip-text text-2xl font-bold text-transparent sm:text-3xl md:text-4xl">
                {value}
              </span>
              <div className="bg-primary/10 text-primary absolute top-0 right-0 flex h-9 w-9 items-center justify-center rounded-full sm:h-12 sm:w-12">
                <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
